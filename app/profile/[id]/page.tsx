'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/app/components/navigation/Navbar';
import Sidebar from '@/app/components/navigation/Sidebar';
import { useState, useRef, type ChangeEvent } from "react"
import Image from "next/image"
import { AiOutlineDiscord } from "react-icons/ai";

interface GameAchievement {
  id: string
  title: string
  image: string
  progress: {
    percentage: number
    achieved: number
    total: number
    xp: {
      earned: number
      total: number
    }
  }
}

interface UserProfile {
  username: string
  avatar: string
  banner: string
  level: number
  status: "online" | "away" | "offline" | "playing"
  statusMessage: string
  bio: string
  location: string
  joinDate: string
  socialLinks: {
    discord?: string
    twitter?: string
    twitch?: string
    youtube?: string
  }
}
const ProfilePage = () => {
const [activeTab, setActiveTab] = useState("achievements")
const [filterValue, setFilterValue] = useState("all")
const [sortValue, setSortValue] = useState("progress")
const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
const [isEditUsernameOpen, setIsEditUsernameOpen] = useState(false)
const [isEditStatusOpen, setIsEditStatusOpen] = useState(false)

const fileInputRef = useRef<HTMLInputElement>(null)

const [userProfile, setUserProfile] = useState<UserProfile>({
  username: "AREOPAGO 07",
  avatar: "/placeholder.svg?height=200&width=200",
  banner: "/placeholder.svg?height=400&width=1200",
  level: 23,
  status: "online",
  statusMessage: "Playing Fall Guys",
  bio: "Casual gamer who enjoys platformers and horror games. Always up for a challenge!",
  location: "Madrid, Spain",
  joinDate: "Member since June 2020",
  socialLinks: {
    discord: "areopago#1234",
    twitter: "@areopago07",
    twitch: "areopago07",
  },
})

const [editForm, setEditForm] = useState({ ...userProfile })

const games: GameAchievement[] = [
  {
    id: "fall-guys",
    title: "Red Redemption 2",
    image: "/games/red.png",
    progress: {
      percentage: 29,
      achieved: 10,
      total: 34,
      xp: {
        earned: 150,
        total: 1000,
      },
    },
  },
  {
    id: "evil-within-2",
    title: "Silent hill",
    image: "/games/silenthill.png",
    progress: {
      percentage: 2,
      achieved: 1,
      total: 51,
      xp: {
        earned: 5,
        total: 1000,
      },
    },
  },
]

const handleAvatarClick = () => {
  fileInputRef.current?.click()
}

const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    // In a real app, you would upload this file to a server
    // For this demo, we'll just create a local URL
    const imageUrl = URL.createObjectURL(file)
    setEditForm({ ...editForm, avatar: imageUrl })
  }
}

const handleSaveProfile = () => {
  setUserProfile(editForm)
  setIsEditProfileOpen(false)
}

const handleSaveUsername = () => {
  setUserProfile({ ...userProfile, username: editForm.username })
  setIsEditUsernameOpen(false)
}

const handleSaveStatus = () => {
  setUserProfile({
    ...userProfile,
    status: editForm.status,
    statusMessage: editForm.statusMessage,
  })
  setIsEditStatusOpen(false)
}

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-zinc-500",
  playing: "bg-blue-500",
}

  const params = useParams();
  const id = params.id;

  return (
    <div className="font-medium bg-[#111111] h-screen flex flex-col fixed inset-0">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1">
          <div className="h-full overflow-y-auto">
            <div className="text-white ">
            <div className="min-h-screen  text-white">
      {/* Banner */}
      <div className="relative h-48 md:h-64 w-full">
          <Image 
               src={"/games/banners/wukong.png"} 
               alt="Profile Banner" 
               fill 
               className="object-cover" 
             />
 
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/50 to-[#111111]"></div>
 
  <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] opacity-50"></div>
</div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-1 border-black shadow-lg overflow-hidden relative">
                <Image
                  src={"https://github.com/shadcn.png"}
                  alt="Profile Avatar"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              </div>
              <div
                className={`absolute bottom-14 right-0 w-6 h-6 rounded-full border-2 border-black ${statusColors[userProfile.status]}`}
              ></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{userProfile.username}</h1>
                    <button
                      onClick={() => {
                        setEditForm({ ...userProfile })
                        setIsEditUsernameOpen(true)
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                 
                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                      {userProfile.statusMessage}
                      <button
                        onClick={() => {
                          setEditForm({ ...userProfile })
                          setIsEditStatusOpen(true)
                        }}
                        className="text-zinc-500 hover:text-zinc-400 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">{userProfile.joinDate}</div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    
                    {isPrivacyOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg py-1 z-10">
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700">Public</button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700">
                          Friends of Friends
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700">Friends Only</button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700">Private</button>
                      </div>
                    )}
                  </div>
                  <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-2 text-sm text-white/80">{userProfile.bio}</div>

              {/* Location */}
              <div className="mt-2 text-sm text-white/50 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {userProfile.location}
              </div>

              {/* Social Links */}
              <div className="mt-4 flex gap-3">
                {userProfile.socialLinks.discord && (
                  <a href="#" className="text-white/70 hover:text-indigo-400 transition-colors">
                   <AiOutlineDiscord  className='text-[1.35rem] font-bold'/>
                  </a>
                )}
                {userProfile.socialLinks.twitter && (
                  <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                )}
                {userProfile.socialLinks.twitch && (
                  <a href="#" className="text-white/70 hover:text-purple-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <div className="text-sm text-white/70">Total XP Earned</div>
            </div>
            <div className="text-2xl font-bold text-white/70">155 XP</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <div className="text-sm text-white/70">Achievements</div>
            </div>
            <div className="text-2xl font-bold text-white/70">11</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
                <path d="M12 2v6" />
                <path d="M12 16v6" />
                <path d="M16.24 7.76l-4.24 4.24" />
                <path d="m19.07 4.93-2.83 2.83" />
              </svg>
              <div className="text-sm text-white/70">Platinum</div>
            </div>
            <div className="text-2xl font-bold text-white/70">0</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-800 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("achievements")}
              className={`pb-4 relative ${
                activeTab === "achievements" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Achievements
              {activeTab === "achievements" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`pb-4 relative ${
                activeTab === "friends" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Friends
              {activeTab === "friends" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`pb-4 relative ${activeTab === "games" ? "text-white" : "text-zinc-400 hover:text-zinc-300"}`}
            >
              Games
              {activeTab === "games" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-4 relative ${
                activeTab === "activity" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Activity
              {activeTab === "activity" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>}
            </button>
          </div>
        </div>

        {activeTab === "achievements" && (
          <>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative">
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="appearance-none bg-transparent border border-zinc-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-zinc-600"
                >
                  <option value="all">Filter All</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <div className="relative">
                <select
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                  className="appearance-none bg-transparent border border-zinc-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-zinc-600"
                >
                  <option value="progress">Progress</option>
                  <option value="name">Name</option>
                  <option value="recent">Recent</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Games List */}
            <div className="space-y-4 mb-8">
              {games.map((game) => (
                <div key={game.id} className="bg-zinc-900 rounded-lg overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-80 h-48 relative">
                      <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="object-cover" />
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-medium mb-4">{game.title}</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Achievement Progress</span>
                            <span>{game.progress.percentage}%</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full"
                              style={{ width: `${game.progress.percentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {game.progress.achieved}/{game.progress.total} Achievements
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Total XP Earned</span>
                            <span>
                              {game.progress.xp.earned}/{game.progress.xp.total} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "friends" && (
          <div className="text-center py-12 text-zinc-400">Friends tab content will appear here</div>
        )}

        {activeTab === "games" && (
          <div className="text-center py-12 text-zinc-400">Games library tab content will appear here</div>
        )}

        {activeTab === "activity" && (
          <div className="text-center py-12 text-zinc-400">Activity feed will appear here</div>
        )}
      </div>

      {/* Edit Username Modal */}
      {isEditUsernameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-medium mb-4">Change Username</h3>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditUsernameOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUsername}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditStatusOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-medium mb-4">Change Status</h3>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="playing">Playing</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Status Message</label>
              <input
                type="text"
                value={editForm.statusMessage}
                onChange={(e) => setEditForm({ ...editForm, statusMessage: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditStatusOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium mb-4">Edit Profile</h3>

            <div className="mb-6">
            
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={"https://github.com/shadcn.png"}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Change Avatar
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Social Links</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-400"
                  >
                    <path d="M9 12h.01" />
                    <path d="M15 12h.01" />
                    <path d="M7.5 4h9a4.5 4.5 0 0 1 4.5 4.5v7a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 15.5v-7A4.5 4.5 0 0 1 7.5 4Z" />
                    <path d="M8 17v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Discord username"
                    value={editForm.socialLinks.discord || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          discord: e.target.value,
                        },
                      })
                    }
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Twitter handle"
                    value={editForm.socialLinks.twitter || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400"
                  >
                    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Twitch username"
                    value={editForm.socialLinks.twitch || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        socialLinks: {
                          ...editForm.socialLinks,
                          twitch: e.target.value,
                        },
                      })
                    }
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;