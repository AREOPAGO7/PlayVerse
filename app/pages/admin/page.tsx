"use client"
import { useState, useEffect, useCallback } from "react"
import type React from "react"
import Image from "next/image" // Import Next.js Image component
import { db } from "../../firebase/config"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"

// Environment variables
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY
const RAWG_BASE_URL = "https://api.rawg.io/api"

// Updated interface to match Firestore structure shown in screenshot
interface Game {
  id: string // Document ID (e.g., "3498", "324997")
  name: string // Game name as shown in screenshot
  price: number // Price value
  discount: number // Discount value
  imageUrl?: string // Will be fetched from RAWG
  rawgId?: string // Optional - useful if different from document ID
}

import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"

const AdminDashboard = () => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const fetchGamesFromFirestore = useCallback(async () => {
    try {
      setLoading(true)
      const gamesCollection = collection(db, "games")
      const gameSnapshot = await getDocs(gamesCollection)

      // Create array of game promises that include image fetching
      const gamePromises = gameSnapshot.docs.map(async (doc) => {
        const gameData = doc.data()
        const game: Game = {
          id: doc.id,
          name: gameData.name || "Unknown Game",
          price: gameData.price || 0,
          discount: gameData.discount || 0,
          imageUrl: "",
          // Use document ID as RAWG ID by default
          rawgId: doc.id,
        }

        // Fetch image from RAWG using document ID
        game.imageUrl = await fetchImageFromRawg(game.rawgId || game.id)
        return game
      })

      const gameList = await Promise.all(gamePromises)
      setGames(gameList)
      setError(null)
    } catch (error) {
      console.error("Error fetching games from Firestore:", error)
      setError("Failed to fetch games. Please check your console for details.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGamesFromFirestore()
  }, [fetchGamesFromFirestore]) // Add fetchGamesFromFirestore as a dependency

  // Fetch image from RAWG API
  const fetchImageFromRawg = async (gameId: string): Promise<string> => {
    try {
      if (!RAWG_API_KEY) {
        console.error("RAWG API key not found")
        return ""
      }

      const response = await fetch(`${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`)

      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`)
      }

      const data = await response.json()
      return data.background_image || ""
    } catch (error) {
      console.error(`Error fetching image for game ID ${gameId}:`, error)
      return ""
    }
  }

  // Update game in Firestore
  const updateGame = async (gameData: Game) => {
    try {
      const gameRef = doc(db, "games", gameData.id)

      // Only update the fields that are in your Firestore structure
      await updateDoc(gameRef, {
        name: gameData.name,
        price: gameData.price,
        discount: gameData.discount,
        // Note: We don't save imageUrl to Firestore as it's fetched from RAWG
      })

      // Update local state
      setGames(games.map((game) => (game.id === gameData.id ? gameData : game)))

      setEditingGame(null)
    } catch (error) {
      console.error("Error updating game:", error)
      setError("Failed to update game.")
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingGame) return

    const { name, value } = e.target
    let processedValue: string | number = value

    // Convert to number for price and discount fields
    if (name === "price" || name === "discount") {
      processedValue = Number(value) || 0
    }

    setEditingGame({
      ...editingGame,
      [name]: processedValue,
    })
  }

  // Start editing a game
  const startEditing = (game: Game) => {
    setEditingGame({ ...game })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingGame(null)
  }

  // Force refresh image for a game
  const refreshGameImage = async (game: Game) => {
    try {
      const newImageUrl = await fetchImageFromRawg(game.rawgId || game.id)

      // Update local state only
      setGames(games.map((g) => (g.id === game.id ? { ...g, imageUrl: newImageUrl } : g)))
    } catch (error) {
      console.error("Error refreshing game image:", error)
    }
  }

  // Toggle dark/light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`${darkMode ? "" : "light"} min-h-screen transition-colors duration-200`}>
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
      <Sidebar darkMode={darkMode} sidebarOpen={sidebarOpen} />
      
      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} pt-16`}>
        <div className={`p-4 md:p-6 ${darkMode ? "bg-[#111111] text-white" : "bg-gray-50 text-gray-800"} min-h-screen`}>
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <span className={`${darkMode ? "bg-green-600" : "bg-green-500"} w-2 h-6 mr-3 rounded-sm inline-block`}></span>
            Game Admin Dashboard
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div
                className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${darkMode ? "border-green-500" : "border-green-600"}`}
              ></div>
            </div>
          ) : error ? (
            <div
              className={`${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"} border text-red-400 p-4 rounded-lg mb-6`}
            >
              <p>{error}</p>
              <button
                onClick={fetchGamesFromFirestore}
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Edit Form Modal */}
              {editingGame && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div
                    className={`${darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-200"} p-5 rounded-xl w-full max-w-md border shadow-xl`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Edit Game</h2>
                      <button
                        onClick={cancelEditing}
                        className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
                      >
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
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editingGame.name}
                          onChange={handleInputChange}
                          className={`w-full ${darkMode ? "bg-[#222222] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-800"} p-2 rounded-md border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Price ($)
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={editingGame.price}
                            onChange={handleInputChange}
                            step="0.01"
                            className={`w-full ${darkMode ? "bg-[#222222] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-800"} p-2 rounded-md border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            name="discount"
                            value={editingGame.discount}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className={`w-full ${darkMode ? "bg-[#222222] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-800"} p-2 rounded-md border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all`}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Game ID
                        </label>
                        <input
                          type="text"
                          value={editingGame.id}
                          disabled
                          className={`w-full ${darkMode ? "bg-[#222222] border-gray-700 text-gray-500" : "bg-gray-100 border-gray-300 text-gray-500"} p-2 rounded-md border`}
                        />
                        <p className="text-xs text-gray-500 mt-1">Used to fetch images from RAWG</p>
                      </div>

                      {editingGame.imageUrl ? (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Preview
                          </label>
                          <div className="relative rounded-md overflow-hidden h-36">
                            <Image
                              src={editingGame.imageUrl || "/placeholder.svg"}
                              alt={editingGame.name}
                              className="w-full h-full object-cover"
                              width={300}
                              height={200}
                              layout="responsive"
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`h-36 rounded-md ${darkMode ? "bg-[#222222]" : "bg-gray-100"} flex flex-col items-center justify-center`}
                        >
                          <span className="text-gray-500 text-sm">No image available</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={cancelEditing}
                          className={`px-4 py-2 ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"} rounded-md transition-colors`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateGame(editingGame)}
                          className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors text-white"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Games Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className={`${darkMode ? "bg-[#1A1A1A] border-gray-800/50 hover:border-gray-700 group-hover:shadow-green-900/5" : "bg-white border-gray-200/50 hover:border-gray-300 group-hover:shadow-green-500/5"} rounded-lg overflow-hidden border hover:shadow-lg transition-all group`}
                  >
                    <div className={`relative h-36 ${darkMode ? "bg-[#222222]" : "bg-gray-100"}`}>
                      {game.imageUrl ? (
                        <Image
                          src={game.imageUrl || "/placeholder.svg"}
                          alt={game.name}
                          className="w-full h-full object-cover"
                          width={300}
                          height={200}
                          layout="responsive"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-gray-500 text-xs mb-2">No image</span>
                          <button
                            onClick={() => refreshGameImage(game)}
                            className="px-2 py-1 bg-green-600/80 rounded text-xs hover:bg-green-600 transition-colors text-white"
                          >
                            Fetch Image
                          </button>
                        </div>
                      )}

                      {game.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          -{game.discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h2
                        className={`text-sm font-medium line-clamp-1 group-hover:text-green-400 transition-colors ${darkMode ? "" : "text-gray-800"}`}
                      >
                        {game.name}
                      </h2>

                      <div
                        className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"} flex items-baseline gap-1.5`}
                      >
                        {game.discount > 0 ? (
                          <>
                            <span
                              className={`${darkMode ? "text-red-400/70" : "text-red-500/70"} line-through text-xs`}
                            >
                              ${game.price.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold">
                              ${(game.price * (1 - game.discount / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">${game.price.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <button
                          onClick={() => refreshGameImage(game)}
                          className={`p-1.5 ${darkMode ? "bg-[#222222] hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"} rounded-md transition-colors`}
                          title="Refresh Image"
                        >
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
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                          </svg>
                        </button>

                        <button
                          onClick={() => startEditing(game)}
                          className="p-1.5 bg-green-600/80 hover:bg-green-600 rounded-md transition-colors text-white"
                          title="Edit Game"
                        >
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard