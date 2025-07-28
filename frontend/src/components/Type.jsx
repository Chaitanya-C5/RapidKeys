import { useState, useEffect, useRef } from "react"
import { Hourglass, TypeOutline, RotateCcw } from "lucide-react"
import { COMMON_WORDS } from "../lib/utils"

function Type() {
  const [mode, setMode] = useState("words")
  const wordOptions = [10, 25, 50]
  const timeOptions = [15, 30, 60]
  const [wordCount, setWordCount] = useState(10)
  const [timeCount, setTimeCount] = useState(15)

  // Typing words state
  const [words, setWords] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [typedHistory, setTypedHistory] = useState([]) 
  const inputRef = useRef(null)

  // Display state for 4-line view
  const [displayStartIndex, setDisplayStartIndex] = useState(0)
  const wordsPerLine = 12 // Approximate words per line
  const totalDisplayWords = wordsPerLine * 4 // 4 lines

  // Stats tracking
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [correctCharCount, setCorrectCharCount] = useState(0)
  const [incorrectCharCount, setIncorrectCharCount] = useState(0)
  const [testCompleted, setTestCompleted] = useState(false)

  // Ref to track if this is initial word generation or appending
  const isAppendingWords = useRef(false)

  // Helper to get random words
  const getRandomWords = (count) => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)])
    }
    return arr
  }

  // Generate initial words when component mounts or mode/settings change
  const generateInitialWords = () => {
    isAppendingWords.current = false
    if (mode === "words") {
      setWords(getRandomWords(wordCount))
    } else {
      // For time mode, generate a longer sequence
      setWords(getRandomWords(100))
    }
  }

  // Reset all state for a fresh test
  const resetTest = () => {
    setStartTime(null)
    setElapsedTime(0)
    setCorrectCharCount(0)
    setIncorrectCharCount(0)
    setTestCompleted(false)
    setCurrentWordIndex(0)
    setTypedHistory([])
    setInputValue("")
    setDisplayStartIndex(0)
  }

  // Regenerate words when mode or option changes
  useEffect(() => {
    generateInitialWords()
    resetTest() // Always reset state when mode changes
  }, [mode, wordCount, timeCount])

  // Consolidated timer logic for both modes
  useEffect(() => {
    let timer
    if (startTime !== null && !testCompleted) {
      const shouldContinue = mode === "words" 
        ? currentWordIndex < words.length 
        : elapsedTime < timeCount
      
      if (shouldContinue) {
        timer = setInterval(() => {
          const newElapsedTime = (Date.now() - startTime) / 1000
          setElapsedTime(newElapsedTime)
          
          // Check if time is up in time mode
          if (mode === "time" && newElapsedTime >= timeCount) {
            setTestCompleted(true)
          }
        }, 100)
      }
    }
    return () => clearInterval(timer)
  }, [startTime, currentWordIndex, mode, timeCount, testCompleted])

  // Reset stats and completion when words regenerate (but not when appending)
  useEffect(() => {
    // Only reset if this is not an append operation
    if (!isAppendingWords.current) {
      resetTest()
    }
  }, [words])

  // When time is up in time mode, freeze stats and input
  useEffect(() => {
    if (mode === "time" && elapsedTime >= timeCount && !testCompleted) {
      setTestCompleted(true)
    }
  }, [mode, elapsedTime, timeCount, testCompleted])

  // Keep supplying words in time mode
  useEffect(() => {
    if (mode === "time" && words.length - currentWordIndex < 20) {
      isAppendingWords.current = true
      setWords((prev) => [...prev, ...getRandomWords(50)])
    }
  }, [mode, words, currentWordIndex])

  // Update display window when user progresses
  useEffect(() => {
    const currentDisplayEnd = displayStartIndex + totalDisplayWords
    if (currentWordIndex >= currentDisplayEnd - wordsPerLine) {
      setDisplayStartIndex(prev => prev + wordsPerLine)
    }
  }, [currentWordIndex, displayStartIndex, totalDisplayWords, wordsPerLine])

  // Focus hidden input on mount and when words change
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [words])

  // Calculate accuracy for a word
  const calculateWordAccuracy = (typedWord, actualWord) => {
    let correct = 0
    let incorrect = 0
    
    // Count character matches
    const minLength = Math.min(typedWord.length, actualWord.length)
    for (let i = 0; i < minLength; i++) {
      if (typedWord[i] === actualWord[i]) {
        correct++
      } else {
        incorrect++
      }
    }
    
    // Count missing or extra characters as incorrect
    incorrect += Math.abs(typedWord.length - actualWord.length)
    
    return { correct, incorrect }
  }

  // Helper function to check if a word was typed correctly
  const isWordCorrect = (typedWord, actualWord) => {
    return typedWord === actualWord
  }

  // Go back to previous word (only if it has errors)
  const goToPreviousWord = () => {
    if (currentWordIndex > 0) {
      const prevWordIndex = currentWordIndex - 1
      const prevTypedWord = typedHistory[prevWordIndex] || ""
      const prevActualWord = words[prevWordIndex] || ""
      
      // Only allow going back if the previous word has errors
      if (!isWordCorrect(prevTypedWord, prevActualWord)) {
        setCurrentWordIndex(prevWordIndex)
        setInputValue(prevTypedWord)
        // Remove the word from history so it can be retyped
        setTypedHistory(prev => prev.slice(0, prevWordIndex))
        
        // Recalculate stats by removing the previous word's contribution
        const { correct, incorrect } = calculateWordAccuracy(prevTypedWord, prevActualWord)
        setCorrectCharCount(prev => prev - correct)
        setIncorrectCharCount(prev => prev - incorrect)
      }
    }
  }

  // Finish current word and move to next
  const finishWord = () => {
    if (startTime === null) setStartTime(Date.now())
    
    const currentWord = words[currentWordIndex] || ""
    const typedWord = inputValue.trim()
    
    // Calculate accuracy
    const { correct, incorrect } = calculateWordAccuracy(typedWord, currentWord)
    
    // Update stats
    setCorrectCharCount(prev => prev + correct)
    setIncorrectCharCount(prev => prev + incorrect)
    
    // Save typed word to history
    setTypedHistory(prev => [...prev, typedWord])
    
    // Move to next word
    setCurrentWordIndex(prev => {
      const nextIdx = prev + 1
      // Check if test should complete
      if (mode === "words" && nextIdx >= words.length) {
        setTestCompleted(true)
      }
      return nextIdx
    })
    
    // Clear input
    setInputValue("")
  }

  // Handle keyboard input
  const handleInput = (e) => {
    // Prevent input if test is completed or time is up
    if (testCompleted || (mode === "time" && elapsedTime >= timeCount)) {
      e.preventDefault()
      return
    }

    if (e.key === " ") {
      e.preventDefault()
      // Monkeytype behavior: only advance if there's actual content typed
      if (inputValue.length > 0) {
        finishWord()
      }
      // If no content, space does nothing (prevents multiple spaces)
    } else if (e.key === "Backspace") {
      e.preventDefault()
      if (inputValue.length > 0) {
        // Normal backspace within current word
        setInputValue(prev => prev.slice(0, -1))
      } else {
        // At start of current word, try to go to previous word (only if it has errors)
        goToPreviousWord()
      }
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault()
      
      // Start timer on first keystroke
      if (startTime === null) setStartTime(Date.now())
      
      const currentWord = words[currentWordIndex] || ""
      const newValue = inputValue + e.key
      
      // Allow typing with reasonable buffer for extra characters
      if (newValue.length <= currentWord.length + 10) {
        setInputValue(newValue)
        
        // Auto-complete last word in words mode when typed correctly
        if (
          mode === "words" &&
          currentWordIndex === words.length - 1 &&
          newValue === currentWord
        ) {
          // Complete the test immediately without setTimeout to prevent race condition
          if (startTime === null) setStartTime(Date.now())
          
          const { correct, incorrect } = calculateWordAccuracy(newValue, currentWord)
          setCorrectCharCount(prev => prev + correct)
          setIncorrectCharCount(prev => prev + incorrect)
          setTypedHistory(prev => [...prev, newValue])
          setCurrentWordIndex(prev => prev + 1)
          setInputValue("")
          setTestCompleted(true)
        }
      }
    }
  }

  // Helper function to get words for current display window
  const getDisplayWords = () => {
    return words.slice(displayStartIndex, displayStartIndex + totalDisplayWords)
  }

  // Modified renderWord function to work with display indices
  const renderWord = (word, displayIdx) => {
    const actualIdx = displayStartIndex + displayIdx
    
    if (actualIdx < currentWordIndex) {
      // Already typed words
      const typedWord = typedHistory[actualIdx] || ""
      const hasError = !isWordCorrect(typedWord, word)
      
      return (
        <span key={actualIdx} className={`select-none ${hasError ? "text-red-400" : "text-gray-300"}`}>
          {word.split("").map((char, i) => {
            let className = ""
            if (i < typedWord.length) {
              className = typedWord[i] === char ? "text-gray-300" : "text-red-400"
            } else {
              className = hasError ? "text-red-400" : "text-gray-300"
            }
            return (
              <span key={i} className={className}>
                {char}
              </span>
            )
          })}
          {/* Show extra characters if any */}
          {typedWord.length > word.length &&
            typedWord.slice(word.length).split("").map((char, i) => (
              <span key={word.length + i} className="text-red-400 bg-red-900/30">
                {char}
              </span>
            ))}
        </span>
      )
    }
    
    if (actualIdx === currentWordIndex) {
      // Current word being typed
      const caretPos = inputValue.length
      return (
        <span key={actualIdx} className="relative select-none text-white">
          {/* Caret at start if nothing typed */}
          {caretPos === 0 && (
            <span className="inline-block w-0.5 h-6 bg-white animate-pulse align-middle mr-0.5" />
          )}
          {word.split("").map((char, i) => {
            let className = ""
            if (i < inputValue.length) {
              className = inputValue[i] === char ? "text-white" : "text-red-400 bg-red-900/30"
            } else {
              className = "text-gray-500"
            }
            return (
              <span key={i} className={className}>
                {char}
                {/* Caret after this char if caretPos === i+1 */}
                {caretPos === i + 1 && (
                  <span className="inline-block w-0.5 h-6 bg-white animate-pulse align-middle ml-0.5" />
                )}
              </span>
            )
          })}
          {/* Extra letters */}
          {inputValue.length > word.length &&
            inputValue.slice(word.length).split("").map((char, i) => (
              <span
                key={word.length + i}
                className="text-red-400 bg-red-900/30"
              >
                {char}
                {/* Caret after last extra char */}
                {caretPos === word.length + i + 1 && (
                  <span className="inline-block w-0.5 h-6 bg-white animate-pulse align-middle ml-0.5" />
                )}
              </span>
            ))}
        </span>
      )
    }
    
    // Untyped/upcoming words
    return (
      <span key={actualIdx} className="text-gray-600 opacity-60 select-none">
        {word}
      </span>
    )
  }

  // Calculate stats
  const totalChars = correctCharCount + incorrectCharCount
  const accuracy = totalChars === 0 ? 100 : ((correctCharCount / totalChars) * 100).toFixed(2)
  const minutes = elapsedTime / 60
  const wpm = minutes > 0 ? Math.round((correctCharCount / 5) / minutes) : 0

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header options: time/words */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
        <div className="flex gap-4 sm:gap-8">
          <button
            className={`flex gap-1 items-center px-2 py-2 rounded transition-colors ${mode === "time" ? "bg-gray-700 text-white" : "bg-transparent text-gray-400 hover:bg-gray-800"}`}
            onClick={() => setMode("time")}
          >
            <Hourglass className="" size={24} />
            <span className="text-md mt-1">time</span>
          </button>

          <button
            className={`flex gap-1 items-center px-2 py-2 rounded transition-colors ${mode === "words" ? "bg-gray-700 text-white" : "bg-transparent text-gray-400 hover:bg-gray-800"}`}
            onClick={() => setMode("words")}
          >
            <TypeOutline className="" size={24} />
            <span className="text-md mt-1">words</span>
          </button>
        </div>

        <div className="hidden sm:block w-px h-10 bg-gray-600 mx-4"></div>

        <div className="flex gap-2 items-center justify-center">
          {mode === "words" && wordOptions.map(opt => (
            <button
              key={opt}
              className={`px-3 py-1 rounded text-sm transition-colors ${wordCount === opt ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
              onClick={() => setWordCount(opt)}
            >
              {opt}
            </button>
          ))}
          
          {mode === "time" && timeOptions.map(opt => (
            <button
              key={opt}
              className={`px-3 py-1 rounded text-sm transition-colors ${timeCount === opt ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
              onClick={() => setTimeCount(opt)}
            >
              {opt}
            </button>
          ))}
          <span className="ml-2 text-xs text-gray-400 select-none">
            {mode === "words" ? "words" : "seconds"}
          </span>
        </div>
      </div>

      {/* Typing section: display only current 4 lines */}
      <div
        className="w-full max-w-4xl mt-8 px-4 py-6 rounded shadow text-lg sm:text-xl cursor-text"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {/* Render words in 4 lines */}
        {Array.from({ length: 4 }, (_, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap gap-x-4 gap-y-2 mb-4 justify-center min-h-[2rem]">
            {getDisplayWords()
              .slice(lineIndex * wordsPerLine, (lineIndex + 1) * wordsPerLine)
              .map((word, wordIndex) => renderWord(word, lineIndex * wordsPerLine + wordIndex))
            }
          </div>
        ))}
      </div>
      
      {/* Hidden input for capturing typing */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        value={inputValue}
        onKeyDown={handleInput}
        tabIndex={-1}
        autoFocus
        spellCheck={false}
        onChange={() => {}}
      />

      {/* Stats */}
      <div className="mt-4 flex gap-8 text-gray-400 text-md">
        <span>Time: {elapsedTime.toFixed(1)}s</span>
        <span>WPM: {wpm}</span>
        <span>Accuracy: {accuracy}%</span>
      </div>

      {/* Test completion message */}
      {testCompleted && (
        <div className="mt-6 text-center">
          <div className="text-lg custom-color mb-3">Test Completed</div>
          <button
            onClick={() => {
              resetTest()
              generateInitialWords()
            }}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={16} />
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

export default Type