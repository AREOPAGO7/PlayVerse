"use client"
import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "../../firebase/config"
import { useUser } from "../../contexts/UserContext"
import Sidebar from "@/app/components/navigation/Sidebar"
import Navbar from "../../components/navigation/Navbar"

// Import components
import ImageUploader from "../../components/profile/image-uploader"
import StatsCard from "../../components/profile/stats-card"
import UserBio from "../../components/profile/user-bio"
import LevelProgress from "../../components/profile/level-progress"
import FavoriteGame from "../../components/profile/favourite-game"
import AchievementsSection from "../../components/profile/achievements-section"

// Types
interface User {
  uid: string
  username: string
  avatar: string
  banner: string
  joinDate: string
  bio: string
  location: string
  country: string
  level: number
  xp: number
  totalPlaytime: number
  favoriteGame: string
  friendCount: number
  rank: string
}

const UserProfilePage = () => {
  const { user } = useUser() // global state for logged in user
  const [profileData, setProfileData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) return

      try {
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfileData({ id: docSnap.id, ...docSnap.data() } as unknown as User)
          setEditedUser({ id: docSnap.id, ...docSnap.data() } as unknown as User)
        } else {
          const newUser = {
            uid: user.uid,
            username: "",
            avatar: "",
            banner: "",
            joinDate: new Date().toISOString(),
            bio: "",
            location: "",
            country: "",
            level: 1,
            xp: 0,
            totalPlaytime: 0,
            favoriteGame: "",
            friendCount: 0,
            rank: "Rookie",
          } as User
          await setDoc(docRef, newUser)
          setProfileData(newUser)
          setEditedUser(newUser)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user?.uid])

  const handleSaveProfile = async () => {
    if (!user?.uid || !editedUser) return

    try {
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, { ...editedUser })
      setProfileData(editedUser)
      setEditing(false)
    } catch (error) {
      console.error("Error updating user profile:", error)
    }
  }

  // Handle field changes
  const handleFieldChange = (field: keyof User, value: any) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-green-500 animate-spin"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">No profile data found</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 max-w-7xl mx-auto">
          {/* Banner area */}
          <div className="relative mb-20">
            <div className="h-64 rounded-lg overflow-hidden border-2 border-zinc-800">
              {editing ? (
                <ImageUploader
                  onUpload={(url) => handleFieldChange("banner", url)}
                  currentImage={editedUser?.banner}
                  type="banner"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800 relative">
                  {profileData?.banner && (
                    <img
                      src={profileData.banner || "/placeholder.svg"}
                      alt="Profile Banner"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-70"></div>
                </div>
              )}
            </div>

            {/* Edit/save buttons */}
            <div className="absolute right-4 top-4 z-10">
              {editing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-colors border border-zinc-700"
                    title="Save changes"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditedUser(profileData)
                    }}
                    className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700"
                    title="Cancel"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700"
                  title="Edit profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Avatar and basic info */}
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative">
                {editing ? (
                  <ImageUploader
                    onUpload={(url) => handleFieldChange("avatar", url)}
                    currentImage={editedUser?.avatar}
                    type="avatar"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-[#111111] overflow-hidden bg-zinc-800 shadow-lg">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar || "/placeholder.svg"}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-500 flex items-center justify-center">
                        <span className="text-3xl font-bold">
                          {profileData.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-2 border-[#111111] shadow-lg">
                  <div className="text-xs font-bold">LVL {profileData.level || 1}</div>
                </div>
              </div>

              <div className="ml-6 pb-2">
                {editing ? (
                  <input
                    type="text"
                    value={editedUser?.username || ""}
                    onChange={(e) => handleFieldChange("username", e.target.value)}
                    className="bg-zinc-800 border-2 border-zinc-700 px-3 py-2 rounded text-white text-xl font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Username"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{profileData.username || "Anonymous Player"}</h1>
                )}
                <div className="flex text-zinc-400 text-sm">
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedUser?.location || ""}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        placeholder="Location"
                        className="bg-zinc-800 border-2 border-zinc-700 px-3 py-1 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={editedUser?.country || ""}
                        onChange={(e) => handleFieldChange("country", e.target.value)}
                        placeholder="Country"
                        className="bg-zinc-800 border-2 border-zinc-700 px-3 py-1 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {profileData.location && <span className="mr-3">{profileData.location}</span>}
                      {profileData.country && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-zinc-600 mr-3"></span>
                          <span>{profileData.country}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* User bio */}
                <UserBio
                  bio={profileData.bio}
                  editing={editing}
                  editedBio={editedUser?.bio || ""}
                  onBioChange={(bio) => handleFieldChange("bio", bio)}
                />

                {/* Level progress */}
                <LevelProgress
                  level={profileData.level || 1}
                  xp={profileData.xp || 0}
                  editing={editing}
                  editedLevel={editedUser?.level || 1}
                  editedXp={editedUser?.xp || 0}
                  onLevelChange={(level) => handleFieldChange("level", level)}
                  onXpChange={(xp) => handleFieldChange("xp", xp)}
                />

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <StatsCard
                    title="Rank"
                    value={profileData.rank || "Rookie"}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    }
                  />
                  <StatsCard
                    title="Play Time"
                    value={`${profileData.totalPlaytime || 0}h`}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  />
                  <StatsCard
                    title="Friends"
                    value={profileData.friendCount || 0}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    }
                  />
                  <StatsCard
                    title="Joined"
                    value={new Date(profileData.joinDate || Date.now()).toLocaleDateString()}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />
                </div>

                {/* Favorite Game */}
                <FavoriteGame
                  favoriteGame={profileData.favoriteGame || ""}
                  editing={editing}
                  editedFavoriteGame={editedUser?.favoriteGame || ""}
                  onFavoriteGameChange={(game) => handleFieldChange("favoriteGame", game)}
                />
              </div>

              {/* Right column - Achievements */}
              <div>
                <AchievementsSection
                  friendCount={profileData.friendCount || 0}
                  totalPlaytime={profileData.totalPlaytime || 0}
                  editing={editing}
                  editedFriendCount={editedUser?.friendCount || 0}
                  editedTotalPlaytime={editedUser?.totalPlaytime || 0}
                  onFriendCountChange={(count) => handleFieldChange("friendCount", count)}
                  onTotalPlaytimeChange={(time) => handleFieldChange("totalPlaytime", time)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage

