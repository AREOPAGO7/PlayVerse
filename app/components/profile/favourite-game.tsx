"use client"

import type React from "react"

interface FavoriteGameProps {
  favoriteGame: string
  editing: boolean
  editedFavoriteGame: string
  onFavoriteGameChange: (game: string) => void
}

const FavoriteGame: React.FC<FavoriteGameProps> = ({
  favoriteGame,
  editing,
  editedFavoriteGame,
  onFavoriteGameChange,
}) => {
  return (
      <div className="bg-zinc-900 rounded-lg p-6 shadow-lg border border-zinc-800 light:bg-zinc-200 light:border-zinc-300">
      <h2 className="text-lg font-bold mb-4 border-b border-zinc-800 light:border-zinc-400 pb-2 light:text-zinc-800">Favorite Game</h2>
      {editing ? (
        <input
          type="text"
          value={editedFavoriteGame || ""}
          onChange={(e) => onFavoriteGameChange(e.target.value)}
          placeholder="What's your favorite game?"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent light:bg-zinc-200 light:text-zinc-800 light:border-zinc-300"
        />
      ) : (
        <div className="flex items-center">
          {favoriteGame ? (
            <>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg mr-3 flex items-center justify-center border border-zinc-700">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <p className="text-white font-medium">{favoriteGame}</p>
                <p className="text-xs text-zinc-500">Favorite Game</p>
              </div>
            </>
          ) : (
            <p className="text-zinc-400">This player hasn't selected a favorite game yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default FavoriteGame

