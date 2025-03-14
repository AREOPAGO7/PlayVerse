import type React from "react"

interface AchievementProps {
  title: string
  description: string
  progress: number
  maxProgress: number
  unlocked: boolean
}

const Achievement: React.FC<AchievementProps> = ({ title, description, progress, maxProgress, unlocked }) => {
  const progressPercentage = (progress / maxProgress) * 100

  return (
    <div
      className={`p-4 rounded-lg ${unlocked ? "bg-zinc-800/80" : "bg-zinc-900"} mb-3 border-l-4 ${unlocked ? "border-green-500" : "border-zinc-700"} transition-all hover:translate-x-1`}
    >
      <div className="flex items-start">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${unlocked ? "bg-green-500" : "bg-zinc-800"} border border-zinc-700`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 ${unlocked ? "text-white" : "text-zinc-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">{title}</h3>
            {unlocked && <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Unlocked</span>}
          </div>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3 border border-zinc-700">
            <div
              className={`h-1.5 rounded-full ${unlocked ? "bg-green-500" : "bg-zinc-700"}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-zinc-500 mt-1 text-right">
            {progress} / {maxProgress}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Achievement

