import { useState, useEffect, useRef, useCallback } from 'react'

interface Prompt {
  id: string
  text: string
}

interface GameState {
  userInput: string
  startTime: number | null
  errors: number
  isFinished: boolean
}

function getDailyPrompt(prompts: Prompt[]): Prompt {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const match = prompts.find((p) => p.id === today)
  return match ?? prompts.find((p) => p.id === 'default') ?? prompts[0]
}

function calcWPM(input: string, startTime: number): number {
  const elapsed = (Date.now() - startTime) / 1000 / 60 // minutes
  if (elapsed === 0) return 0
  const words = input.trim().split(/\s+/).length
  return Math.round(words / elapsed)
}

function calcAccuracy(input: string, target: string): number {
  if (input.length === 0) return 100
  let correct = 0
  for (let i = 0; i < input.length; i++) {
    if (input[i] === target[i]) correct++
  }
  return Math.round((correct / input.length) * 100)
}

export default function TypingGame() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [state, setState] = useState<GameState>({
    userInput: '',
    startTime: null,
    errors: 0,
    isFinished: false,
  })
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/prompts.json')
      .then((r) => r.json())
      .then((data: Prompt[]) => {
        setPrompts(data)
        setPrompt(getDailyPrompt(data))
      })
  }, [])

  const reset = useCallback(() => {
    setState({ userInput: '', startTime: null, errors: 0, isFinished: false })
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!prompt || state.isFinished) return
      const value = e.target.value
      const now = Date.now()

      setState((prev) => {
        const startTime = prev.startTime ?? now
        // Count new errors: characters that don't match the prompt
        let errors = 0
        for (let i = 0; i < value.length; i++) {
          if (value[i] !== prompt.text[i]) errors++
        }
        const isFinished = value.length >= prompt.text.length
        return { userInput: value, startTime, errors, isFinished }
      })
    },
    [prompt, state.isFinished],
  )

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading daily challenge...</p>
      </div>
    )
  }

  const { userInput, startTime, errors, isFinished } = state
  const wpm = startTime && userInput.length > 0 ? calcWPM(userInput, startTime) : 0
  const accuracy = calcAccuracy(userInput, prompt.text)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Daily Typing Challenge</h1>
          <p className="text-gray-400 text-sm">{today}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-blue-400">{wpm}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">WPM</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-emerald-400">{accuracy}%</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Accuracy</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-rose-400">{errors}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Errors</p>
          </div>
        </div>

        {/* Prompt display */}
        <div className="bg-gray-900 rounded-xl p-6" dir="rtl">
          <p className="text-lg leading-loose break-words select-none" style={{ fontFamily: '"Tajawal", "Amiri", "Traditional Arabic", serif' }}>
            {prompt.text.split('').map((char, i) => {
              let className = 'text-gray-500'
              if (i < userInput.length) {
                className =
                  userInput[i] === char
                    ? 'text-emerald-400'
                    : 'text-rose-400 underline decoration-rose-500'
              } else if (i === userInput.length) {
                className = 'text-gray-100 border-b-2 border-blue-400'
              }
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              )
            })}
          </p>
        </div>

        {/* Input area */}
        {!isFinished ? (
          <textarea
            ref={inputRef}
            autoFocus
            dir="rtl"
            lang="ar"
            value={userInput}
            onChange={handleInput}
            disabled={isFinished}
            rows={3}
            placeholder="ابدأ الكتابة لبدء التحدي..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-base text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
            style={{ fontFamily: '"Tajawal", "Amiri", "Traditional Arabic", serif' }}
          />
        ) : (
          <div className="bg-gray-900 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4">
            <p className="text-2xl font-bold text-emerald-400">Challenge Complete!</p>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <span>
                <span className="text-blue-400 font-bold text-lg">{wpm}</span> WPM
              </span>
              <span>
                <span className="text-emerald-400 font-bold text-lg">{accuracy}%</span> Accuracy
              </span>
              <span>
                <span className="text-rose-400 font-bold text-lg">{errors}</span> Errors
              </span>
            </div>
            <button
              onClick={reset}
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-600">
          A new prompt unlocks every day. Come back tomorrow!
        </p>
      </div>
    </div>
  )
}
