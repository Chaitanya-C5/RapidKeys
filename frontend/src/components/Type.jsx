import { useState, useEffect, useRef } from "react"
import { Hourglass, TypeOutline } from "lucide-react"
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

  // Stats tracking
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [correctCharCount, setCorrectCharCount] = useState(0)
  const [incorrectCharCount, setIncorrectCharCount] = useState(0)
  const [testCompleted, setTestCompleted] = useState(false)

  // Helper to get random words
  const getRandomWords = (count) => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)])
    }
    return arr
  }

  // Regenerate words when mode or option changes
  useEffect(() => {
    if (mode === "words") {
      setWords(getRandomWords(wordCount))
    } else {
      // For time mode, generate a longer sequence (e.g., 50 words)
      setWords(getRandomWords(50))
    }
  }, [mode, wordCount, timeCount])

  // Start timer on first input
  useEffect(() => {
    let timer
    if (startTime !== null && currentWordIndex < words.length) {
      timer = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000)
      }, 100)
    }
    return () => clearInterval(timer)
  }, [startTime, currentWordIndex, words.length])

  // Reset stats and completion when words regenerate
  useEffect(() => {
    setStartTime(null)
    setElapsedTime(0)
    setCorrectCharCount(0)
    setIncorrectCharCount(0)
    setTestCompleted(false)
  }, [words])

  // Timer for time mode
  useEffect(() => {
    if (mode !== "time") return
    if (testCompleted || startTime === null) return
    if (elapsedTime >= timeCount) {
      setTestCompleted(true)
      return
    }
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000)
    }, 100)
    return () => clearInterval(timer)
  }, [mode, startTime, elapsedTime, testCompleted, timeCount])

  // When time is up in time mode, freeze stats and input
  useEffect(() => {
    if (mode === "time" && elapsedTime >= timeCount && !testCompleted) {
      setTestCompleted(true)
    }
  }, [mode, elapsedTime, timeCount, testCompleted])

  // Keep supplying words in time mode
  useEffect(() => {
    if (mode === "time" && words.length - currentWordIndex < 10) {
      setWords((prev) => [...prev, ...getRandomWords(20)])
    }
  }, [mode, words, currentWordIndex])

  // Focus hidden input on mount and when words change
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [words])

  // Helper to finish the word and move to next (accepts value)
  const finishWord = (value) => {
    if (startTime === null) setStartTime(Date.now())
    const currentWord = words[currentWordIndex] || ""
    let correct = 0, incorrect = 0
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentWord[i]) correct++
      else incorrect++
    }
    incorrect += Math.abs(currentWord.length - value.length)
    setCorrectCharCount((c) => c + correct)
    setIncorrectCharCount((c) => c + incorrect)
    setTypedHistory((h) => [...h, value])
    setCurrentWordIndex((idx) => {
      const nextIdx = idx + 1
      if (nextIdx >= words.length) setTestCompleted(true)
      return nextIdx
    })
    setInputValue("")
  }
  // In time mode, timer starts on first keystroke
  const handleInput = (e) => {
    if (testCompleted || (mode === "time" && elapsedTime >= timeCount)) return
    const currentWord = words[currentWordIndex] || ""
    const buffer = 2
    const maxLength = currentWord.length + buffer
    if (e.key === " ") {
      finishWord(inputValue)
      e.preventDefault()
    } else if (e.key === "Backspace") {
      setInputValue((v) => v.slice(0, -1))
      e.preventDefault()
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      inputValue.length < maxLength
    ) {
      if (startTime === null) setStartTime(Date.now())
      const newVal = inputValue + e.key
      // In words mode, auto-finish on last word; in time mode, just keep going
      if (
        mode === "words" &&
        currentWordIndex === words.length - 1 &&
        newVal.length >= currentWord.length
      ) {
        finishWord(newVal.slice(0, maxLength))
        setTestCompleted(true)
        e.preventDefault()
        return
      }
      setInputValue(newVal)
      e.preventDefault()
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      inputValue.length >= maxLength
    ) {
      e.preventDefault()
    }
  }

  // Render per-letter highlighting for the current word (Monkeytype style, improved)
  const renderWord = (word, idx) => {
    // Completed words
    if (idx < currentWordIndex) {
      const typed = typedHistory[idx] || ""
      const hasMistake =
        typed.length !== word.length ||
        word.split("").some((char, i) => typed[i] !== char)
      return (
        <span
          key={idx}
          className={`select-none ${hasMistake ? "text-red-500 border-b-2 border-red-500" : "text-white"}`}
          style={hasMistake ? { textDecoration: "none", textDecorationSkipInk: "none" } : {}}
        >
          {word.split("").map((char, i) => {
            if (typed[i] === undefined) return <span key={i}>{char}</span>
            if (typed[i] === char) return <span key={i}>{char}</span>
            // Wrong char
            return (
              <span key={i} className="text-red-500">{char}</span>
            )
          })}
          {/* Extra letters */}
          {typed.length > word.length &&
            typed.slice(word.length).split("").map((char, i) => (
              <span
                key={word.length + i}
                className="text-red-500"
              >
                {char}
              </span>
            ))}
        </span>
      )
    }
    // Current word
    if (idx === currentWordIndex) {
      // Caret position: at the start if nothing typed, else after last typed char
      const caretPos = inputValue.length
      return (
        <span key={idx} className="relative select-none text-white">
          {/* Caret at start if nothing typed */}
          {caretPos === 0 && (
            <span className="inline-block w-0.5 h-6 bg-white animate-pulse align-middle mr-0.5" />
          )}
          {word.split("").map((char, i) => {
            let className = ""
            if (i < inputValue.length) {
              className = inputValue[i] === char ? "text-white" : "text-red-500"
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
                className="text-red-500"
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
      <span key={idx} className="text-gray-600 opacity-60 select-none">
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

      {/* Typing section: display words inline with highlighting */}
      <div
        className="w-full max-w-4xl mt-8 px-4 py-6 rounded shadow flex flex-wrap gap-x-4 gap-y-4 text-lg sm:text-xl justify-center cursor-text"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {words.map((word, idx) => renderWord(word, idx))}
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

      {/* This is graph will be visible */}
      <div>

      </div>
    </div>
  )
}

export default Type