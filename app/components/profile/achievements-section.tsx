"use client"

import type React from "react"
import Achievement from "./achievement"

interface AchievementsSectionProps {
  friendCount: number
  totalPlaytime: number
  editing: boolean
  editedFriendCount: number
  editedTotalPlaytime: number
  onFriendCountChange: (count: number) => void
  onTotalPlaytimeChange: (time: number) => void
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  friendCount,
  totalPlaytime,
  editing,
  editedFriendCount,
  editedTotalPlaytime,
  onFriendCountChange,
  onTotalPlaytimeChange,
}) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 shadow-lg border border-zinc-800">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
        <h2 className="text-lg font-bold text-white">Achievements</h2>
        <button className="text-green-500 text-sm flex items-center hover:underline">
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <Achievement
        title="First Blood"
        description="Win your first match"
        progress={1}
        maxProgress={1}
        unlocked={true}
      />

      <Achievement
        title="Social Butterfly"
        description="Add 10 friends to your network"
        progress={friendCount || 0}
        maxProgress={10}
        unlocked={(friendCount || 0) >= 10}
      />

      <Achievement
        title="Dedicated Player"
        description="Play for at least 100 hours"
        progress={totalPlaytime || 0}
        maxProgress={100}
        unlocked={(totalPlaytime || 0) >= 100}
      />

      {editing && (
        <div className="mt-6 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h3 className="text-sm font-bold text-zinc-300 mb-3 border-b border-zinc-700 pb-2">Edit Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Friends</label>
              <input
                type="number"
                value={editedFriendCount || 0}
                onChange={(e) => onFriendCountChange(Number.parseInt(e.target.value) || 0)}
                className="bg-zinc-700 border border-zinc-600 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Playtime (h)</label>
              <input
                type="number"
                value={editedTotalPlaytime || 0}
                onChange={(e) => onTotalPlaytimeChange(Number.parseInt(e.target.value) || 0)}
                className="bg-zinc-700 border border-zinc-600 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementsSection

