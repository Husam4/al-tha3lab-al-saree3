import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import TypingGame from '../components/TypingGame'

export const Route = createFileRoute('/')({
  component: Home,
})

const modes = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'beginner', label: 'Beginner Course' },
  { id: 'novice', label: 'Novice Course' },
  { id: 'expert', label: 'Expert Course' },
  { id: 'daily', label: 'Daily Challenge' },
]

function Home() {
  const [mode, setMode] = useState<'menu' | 'daily'>('menu')
  const [info, setInfo] = useState<string | null>(null)

  if (mode === 'daily') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setMode('menu')
              setInfo(null)
            }}
            className="mb-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
          >
            ← Back to modes
          </button>
          <TypingGame />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Choose a game mode</h1>
          <p className="text-gray-400 mt-1">Select a mode to begin. Daily Challenge is live now.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {modes.map(({ id, label }) => {
            const isDaily = id === 'daily'
            return (
              <button
                key={id}
                onClick={() => {
                  if (isDaily) {
                    setMode('daily')
                    setInfo(null)
                  } else {
                    setInfo(`${label} will be available soon.`)
                  }
                }}
                className={`w-full text-left px-4 py-4 rounded-xl border transition ${
                  isDaily
                    ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
                    : 'bg-gray-900 border-gray-700 text-gray-100 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {!isDaily && <span className="text-xs text-gray-400">Coming soon</span>}
                </div>
              </button>
            )
          })}
        </div>

        {info ? <p className="text-sm text-amber-300">{info}</p> : null}
      </div>
    </div>
  )
}
