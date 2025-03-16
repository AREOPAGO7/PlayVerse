"use client"

import type React from "react"

interface LevelProgressProps {
  level: number
  xp: number
  editing: boolean
  editedLevel: number
  editedXp: number
  onLevelChange: (level: number) => void
  onXpChange: (xp: number) => void
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  xp,
  editing,
  editedLevel,
  editedXp,
  onLevelChange,
  onXpChange,
}) => {
  const calculateLevelProgress = () => {
    const xpForNextLevel = level * 1000
    return Math.min((xp / xpForNextLevel) * 100, 100)
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 shadow-lg border border-zinc-800 light:bg-zinc-200 light:border-zinc-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Level {level || 1}</h3>
        <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full text-zinc-400 border border-zinc-700 light:bg-zinc-200 light:text-zinc-800 light:border-zinc-300">
          {xp || 0} / {(level || 1) * 1000} XP
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-4 border border-zinc-700 light:bg-zinc-200 light:border-zinc-300">
        <div className="bg-green-500 h-2.5 rounded-full relative" style={{ width: `${calculateLevelProgress()}%` }}>
          {calculateLevelProgress() > 10 && (
            <div className="absolute right-0 -top-1 w-4 h-4 bg-white rounded-full border-2 border-green-500 transform translate-x-1/2"></div>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-4 grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg border border-zinc-700 light:bg-zinc-200 light:border-zinc-300">
          <div>
            <label className="text-xs text-zinc-400 block mb-1 light:text-zinc-800">Experience Points</label>
            <input
              type="number"
              value={editedXp || 0}
              onChange={(e) => onXpChange(Number.parseInt(e.target.value) || 0)}
              className="bg-zinc-700 border border-zinc-600 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent light:bg-zinc-200 light:text-zinc-800 light:border-zinc-300"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1 light:text-zinc-800">Level</label>
            <input
              type="number"
              value={editedLevel || 1}
              onChange={(e) => onLevelChange(Number.parseInt(e.target.value) || 1)}
              className="bg-zinc-700 border border-zinc-600 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent light:bg-zinc-200 light:text-zinc-800 light:border-zinc-300 "
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelProgress

