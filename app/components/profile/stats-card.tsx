import type React from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800 light:bg-zinc-200 light:border-zinc-300">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mr-2 border border-zinc-700 light:bg-zinc-200 light:border-zinc-300">
          {icon}
        </div>
        <h3 className="text-zinc-400 text-sm light:text-zinc-800">{title}</h3>
      </div>
      <p className="text-xl font-bold text-white pl-10 light:text-zinc-800">{value}</p>
    </div>
  )
}

export default StatsCard

