"use client"
import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { db } from "@/app/firebase/config"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import Image from "next/image"

interface User {
    uid: string
    username: string
    email: string
    avatar: string
    status: string
    bio: string
    fidelityPoints: number
    disabled?: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    user !== null
  )

  
  const handleResetPassword = async (email: string) => {
    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent successfully!");
    } catch (error) {
        console.error("Error sending reset email:", error);
        alert("Error sending reset email. Please try again.");
    }
  };
  
  useEffect(() => {
      fetchUsers()
  }, [])

  const fetchUsers = async () => {
      try {
          const usersRef = collection(db, "users")
          const snapshot = await getDocs(usersRef)
          const usersData = snapshot.docs.map(doc => ({
              uid: doc.id,
              ...doc.data()
          } as User))
          setUsers(usersData)
      } catch (error) {
          console.error("Error fetching users:", error)
      } finally {
          setLoading(false)
      }
  }

  const handleUpdateUser = async (user: User) => {
      try {
          const userRef = doc(db, "users", user.uid)
          const updateData = {
              username: user.username || '',
              email: user.email || '',
              bio: user.bio || '',
              status: user.status || 'offline',
              fidelityPoints: user.fidelityPoints || 0
          }

          // Filter out any undefined values
          const cleanedData = Object.fromEntries(
              Object.entries(updateData).filter(([ value]) => value !== undefined)
          )

          await updateDoc(userRef, cleanedData)
          setEditingUser(null)
          fetchUsers()
      } catch (error) {
          console.error("Error updating user:", error)
      }
  }

  const toggleTheme = () => setDarkMode(!darkMode)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
      <div className={darkMode ? "bg-[#111] min-h-screen text-white" : "bg-zinc-50 min-h-screen text-zinc-800"}>
          <Navbar darkMode={darkMode} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
          <Sidebar darkMode={darkMode} sidebarOpen={sidebarOpen} />
  
          <div
              className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} pt-16 p-4 md:p-8`}
          >
              <div className="max-w-7xl mx-auto mt-6 md:mt-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                      <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                      <div className="w-full md:w-auto">
                          <div className="relative">
                              <input
                                  type="text"
                                  placeholder="Search users..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg ${
                                      darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                                  } border focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                              />
                              <svg
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                              >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                          </div>
                      </div>
                  </div>
  
                  {loading ? (
                      <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                      </div>
                  ) : filteredUsers.length === 0 ? (
                      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-zinc-900" : "bg-white"} shadow-lg`}>
                          <svg className="w-16 h-16 mx-auto text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <h2 className="mt-4 text-xl font-semibold">No users found</h2>
                          <p className={`mt-2 ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>Try adjusting your search criteria</p>
                      </div>
                  ) : (
                      <div className="flex flex-col gap-4">
                          {filteredUsers.map(user => (
                              <div
                                  key={user.uid}
                                  className={`w-full rounded-xl ${darkMode ? "bg-zinc-900 hover:bg-zinc-800" : "bg-white hover:bg-zinc-50"
                                      } shadow-lg transition-all duration-200 border ${darkMode ? "border-zinc-800" : "border-zinc-200"
                                      } overflow-hidden`}
                              >
                                  
                                  <div className="p-4 md:p-6">
                                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                                          <div className="relative group w-14 h-14 flex-shrink-0">
                                              <Image
                                                  src={user.avatar || "/placeholder.svg"}
                                                  alt={user.username}
                                                  width={60}
                                                  height={60}
                                                  className="rounded-xl object-cover  ring-1 ring-zinc-800"
                                              />
                                              <div className={`absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                                                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  </svg>
                                              </div>
                                          </div>

                                          {editingUser?.uid === user.uid ? (
                                              <div className="flex-1 space-y-4 w-full">
                                                  <input
                                                      type="text"
                                                      value={editingUser.username}
                                                      onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                                                          } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                      placeholder="Username"
                                                  />
                                                  <input
                                                      type="text"
                                                      value={editingUser.email}
                                                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                                                          } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                      placeholder="Email"
                                                  />
                                                  <textarea
                                                      value={editingUser.bio}
                                                      onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                                                      className={`w-full p-2 rounded-lg ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                                                          } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                      placeholder="Bio"
                                                      rows={3}
                                                  />
                                                  <div className="flex flex-col sm:flex-row gap-4">
                                                      <div className="flex-1">
                                                          <label className="block text-sm font-medium mb-1">Status</label>
                                                          <select
                                                              value={editingUser.status}
                                                              onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                                                              className={`w-full p-2 rounded-lg ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                                                                  } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                          >
                                                              <option value="online">Online</option>
                                                              <option value="offline">Offline</option>
                                                              <option value="away">Away</option>
                                                          </select>
                                                      </div>
                                                      <div className="flex-1">
                                                          <label className="block text-sm font-medium mb-1">Points</label>
                                                          <input
                                                              type="number"
                                                              value={editingUser.fidelityPoints || 0}
                                                              onChange={e => setEditingUser({ ...editingUser, fidelityPoints: Number(e.target.value) || 0 })}
                                                              className={`w-full p-2 rounded-lg ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                                                                  } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                          />
                                                      </div>
                                                  </div>
                                                  <div className="flex gap-2 pt-2">
                                                      <button
                                                          onClick={() => handleUpdateUser(editingUser)}
                                                          className="flex-1 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors font-medium text-white"
                                                      >
                                                          Save Changes
                                                      </button>
                                                      <button
                                                          onClick={() => setEditingUser(null)}
                                                          className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-200 hover:bg-zinc-300"
                                                              }`}
                                                      >
                                                          Cancel
                                                      </button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <div className="flex-1 w-full">
                                                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-3 mb-3">
                                                      <div className="text-center sm:text-left">
                                                          <h3 className="text-md font-semibold">{user.username}</h3>
                                                          <p className={`text-[14px] ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>{user.email}</p>
                                                      </div>
                                                      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                                         
                                                          <button
                                                              onClick={() => handleResetPassword(user.email)}
                                                              className="px-3 py-1.5 text-[10px] rounded-lg border-2 font-semibold border-zinc-800 hover:bg-zinc-500 text-white transition-colors"
                                                          >
                                                              <span className="flex items-center gap-1">
                                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                  </svg>
                                                                  Reset
                                                              </span>
                                                          </button>
                                                          <button
                                                              onClick={() => setEditingUser(user)}
                                                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                                  darkMode ? "bg-zinc-800 text-[8px] hover:bg-zinc-700" : "bg-zinc-200 hover:bg-zinc-300"
                                                              }`}
                                                          >
                                                              <span className="flex items-center gap-1">
                                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                  </svg>
                                                                  Edit
                                                              </span>
                                                          </button>
                                                      </div>
                                                  </div>
                                                  <div className={`p-2 rounded-lg text-zinc-300 text-[12px] font-semibold mb-3 ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
                                                      <p> {user.bio || "No bio available"}</p>
                                                  </div>
                                                  <div className="flex flex-wrap gap-3 text-sm">
                                                      <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${
                                                          user.status === 'online'
                                                              ? 'bg-green-500/20 text-green-400'
                                                              : user.status === 'away'
                                                                  ? 'bg-zinc-500/20 text-zinc-400'
                                                                  : user.status === 'blocked'
                                                                      ? 'bg-zinc-700/20 text-zinc-400'
                                                                      : 'bg-zinc-600/20 text-zinc-400'
                                                      }`}>
                                                          <span className={`w-2 h-2 rounded-full ${
                                                              user.status === 'online'
                                                                  ? 'bg-green-400'
                                                                  : user.status === 'away'
                                                                      ? 'bg-zinc-400'
                                                                      : user.status === 'blocked'
                                                                          ? 'bg-zinc-500'
                                                                          : 'bg-zinc-400'
                                                          }`}></span>
                                                          {user.status}
                                                      </span>
                                                      <span className="px-3 py-1 rounded-full bg-zinc-500/10 text-white flex items-center gap-1 font-semibold text-[12px]">
                                                          
                                                          {user.fidelityPoints ? user.fidelityPoints : 0} Points
                                                      </span>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
  )
}