import { useState, useEffect, useRef } from "react"
import { Hourglass, TypeOutline, RotateCcw, Activity, Target, ChartNoAxesCombined, Trophy } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { COMMON_WORDS } from "../lib/utils"
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useWebSocket } from "../contexts/WebSocketContext"
import { useNavigate, useLocation } from "react-router-dom"

function RacingType({ showModeOptions = true, text = [], givenMode = "words", givenWordCount = 10, givenTimeCount = 15 }) {
  const [mode, setMode] = useState(givenMode)
  const [wordCount, setWordCount] = useState(givenWordCount)
  const [timeCount, setTimeCount] = useState(givenTimeCount)
  const { updateTypingProgress, raceStartTime, sendNotification } = useWebSocket()
  const navigate = useNavigate()
  const location = useLocation()

  const roomCode = location.pathname.split('/')[2]
  console.log(roomCode)

  // Typing words state   
  const [words, setWords] = useState(text)
  const [inputValue, setInputValue] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [typedHistory, setTypedHistory] = useState([]) 
  const inputRef = useRef(null)

  // Display state for 4-line view
  const [displayStartIndex, setDisplayStartIndex] = useState(0)
  const wordsPerLine = 12 // Approximate words per line
  const totalDisplayWords = wordsPerLine * 4 // 4 lines 

  // Stats tracking
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
      setWords(getRandomWords(100))
    }
  }

  // Reset all state for a fresh test
  const resetTest = () => {
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
    if(showModeOptions) generateInitialWords()
    resetTest() // Always reset state when mode changes
  }, [mode, wordCount, timeCount])

    // Timer effect for elapsed time and chart updates
    useEffect(() => {
      let interval = null
      if (raceStartTime && !testCompleted) {
        interval = setInterval(() => {
          const startTime = new Date(raceStartTime).getTime()
          const now = Date.now()
          const elapsed = (now - startTime) / 1000
          setElapsedTime(elapsed)
          
          // Update chart data every second - no delay needed since race has started
          const minutes = elapsed / 60
          const currentWPM = minutes > 0 ? Math.round((correctCharCount / 5) / minutes) : 0
          
          if (updateTypingProgress) {
            updateTypingProgress({
              wpm: currentWPM,
              accuracy: Math.round((correctCharCount / (correctCharCount + incorrectCharCount)) * 100) || 100,
              progress: Math.round((currentWordIndex / words.length) * 100),
            })
            
            
          } else {
            console.log('updateTypingProgress function does not exist')
          }
          
          setChartData(prev => {
            const timePoint = Math.floor(elapsed)
            
            // Only add new data points, don't update existing ones
            const existingIndex = prev.findIndex(point => point.time === timePoint)
            if (existingIndex === -1) {
              return [...prev, { time: timePoint, wpm: currentWPM }]
            }
            
            return prev
          })
        }, 1000) // Update every second
      } else {
        clearInterval(interval)
      }
      
      return () => clearInterval(interval)
    }, [raceStartTime, testCompleted, correctCharCount, incorrectCharCount, currentWordIndex, words.length, updateTypingProgress])


  // Consolidated timer logic for both modes
  useEffect(() => {
    let timer
    if (raceStartTime !== null && !testCompleted) {
      const shouldContinue = mode === "words" 
        ? currentWordIndex < words.length 
        : elapsedTime < timeCount
      
      if (shouldContinue) {
        timer = setInterval(() => {
          const startTime = new Date(raceStartTime).getTime()
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
  }, [raceStartTime, currentWordIndex, mode, timeCount, testCompleted])

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

      sendNotification({
        type: 'race_completed',
        data: {
          mode,
          finalWpm: wpm,
          finalAccuracy: accuracy,
          completionTime: elapsedTime,
          wordsCompleted: currentWordIndex
        }
      })
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

  // Finish current word and move to next
  const finishWord = () => {
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
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault()
      
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

  // Real-time WPM chart data
  const [chartData, setChartData] = useState([])
  const stats = [
    {
      icon: <Activity className="w-8 h-8 text-blue-500" />,
      title: "WPM",
      value: wpm,
      tooltip: `${wpm} WPM`
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "ACCURACY",
      value: accuracy,
      tooltip: (
        <div className="space-y-1">
          <p>{accuracy}%</p>
          <p className="text-green-400">Correct: {correctCharCount}</p>
          <p className="text-red-400">Incorrect: {incorrectCharCount}</p>
        </div>
      )
    },
    {
      icon: <Hourglass className="w-8 h-8 text-purple-500" />,
      title: "TIME",
      value: Math.round(elapsedTime),
      tooltip: `${Math.round(elapsedTime)} seconds`
    }
  ]

  useEffect(() => {
    if (testCompleted) {
      sendNotification({
        type: 'raceCompleted',
        data: {
          mode,
          wpm,
          accuracy,
          elapsedTime,
        },
      })
    }
  }, [testCompleted, mode, wpm, accuracy, elapsedTime, sendNotification])

  return (
    <div className="w-full flex flex-col items-center">
      {/* Typing section: display only current 4 lines - hide when test completed */}
      {!testCompleted && (
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
      )}
      
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

      {/* Test completion results screen */}
      {testCompleted && (
        <div className="mt-8 w-full max-w-4xl ">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Performance Analysis Chart */}
            <div className="flex-1 bg-[#101010] rounded-lg p-6 border border-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <ChartNoAxesCombined className="w-8 h-8 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Performance Analysis</h3>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={{ stroke: '#6B7280' }}
                      axisLine={{ stroke: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={{ stroke: '#6B7280' }}
                      axisLine={{ stroke: '#6B7280' }}
                      domain={[0, 'auto']}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#F9FAFB',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value) => [`${value} WPM`, 'Speed']}
                      labelFormatter={(label) => `Time: ${label}s`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wpm" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
                      connectNulls={false}
                    />
                    <ReferenceLine 
                      y={wpm}
                      stroke="#FBBF24"
                      strokeDasharray="4 4"
                      label={{
                        position: 'top',
                        value: `WPM: ${wpm}`,
                        fill: '#FBBF24',
                        fontSize: 12
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Main Stats Cards */}
            <div className="flex flex-col gap-6 justify-between">
              <TooltipProvider>
                {stats.map((stat, index) => (
                  <ShadcnTooltip key={index}>
                    <TooltipTrigger asChild>
                      <div className='flex items-center bg-[#101010] rounded-lg py-4 px-6 text-center border border-gray-900 justify-start gap-6 cursor-help'>
                        {stat.icon}
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-1">
                            <span className="text-gray-400 text-md uppercase tracking-wide">{stat.title}</span>
                          </div>
                          <div className="text-xl font-bold text-white">
                            {stat.title === 'ACCURACY' ? `${stat.value}%` : stat.title === 'TIME' ? `${stat.value}s` : stat.value}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white border-gray-700">
                      {stat.tooltip}
                    </TooltipContent>
                  </ShadcnTooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
          
          {/* Leaderboard Button */}
          <div className="flex justify-center mt-8">
            <button 
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              onClick={() => navigate('/multiplayer/' + roomCode + '/results')}
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </button>
          </div>
          
          <div className="text-lg text-center mt-4 text-green-400">
            🎉 Race Completed! Great job!
          </div>
        </div>
      )}

      {/* Regular stats during typing (only show when test is not completed) */}
      {!testCompleted && (
        <div className="flex gap-8 text-gray-400 text-md">
          <span>Time: {elapsedTime.toFixed(1)}s</span>
          <span>WPM: {wpm}</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
      )}
    </div>
  )
}

export default RacingType