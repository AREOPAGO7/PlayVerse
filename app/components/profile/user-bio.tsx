"use client"

import type React from "react"

interface UserBioProps {
  bio: string
  editing: boolean
  editedBio: string
  onBioChange: (bio: string) => void
}

const UserBio: React.FC<UserBioProps> = ({ bio, editing, editedBio, onBioChange }) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 shadow-lg border border-zinc-800 light:bg-zinc-200 light:border-zinc-300">
      <h2 className="text-lg font-bold mb-4 text-white border-b light:border-zinc-400 border-zinc-800 pb-2 light:text-black/70">About Me</h2>
      {editing ? (
        <textarea
          value={editedBio || ""}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Write something about yourself..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white h-32 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent light:bg-zinc-200 light:text-black/80 light:border-zinc-400"
        ></textarea>
      ) : (
        <p className="text-zinc-300 leading-relaxed light:text-black/80">{bio || "This player hasn't added a bio yet."}</p>
      )}
    </div>
  )
}

export default UserBio

