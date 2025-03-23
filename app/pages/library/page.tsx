"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "../../components/navigation/Navbar";
import Sidebar from "../../components/navigation/Sidebar";
import { useUser } from "../../contexts/UserContext"
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import axios from "axios"; // For making API requests to RAWG

interface GameItem {
    id: number
    title: string
    image: string
    rawgId: number
    achievements?: {
        completed: number
        total: number
    }
    installed?: boolean
}

const Library = () => {
    const user = useUser(); // Get the current user
    const [games, setGames] = useState<GameItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [gridView, setGridView] = useState(true);
    const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
        "Installed (1)": false,
        Genre: false,
        Features: false,
        Types: false,
        Platform: false,
    });
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // RAWG API Key - Consider using environment variables
    const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY; // Replace with your actual RAWG API key
    console.log(user.uid)
    // Fetch user's owned games and game details
    useEffect(() => {
        const fetchUserGames = async () => {
            console.log("User object:", user.user); // Check user object
            
            if (!user.user || !user.user.uid) {
                console.log("No user or user.uid is missing");
                setLoading(false);
                return;
            }
            
            try {
                // Get Firestore instance
                const db = getFirestore();
                
                console.log("Attempting to fetch user document for uid:", user.user.uid);
                
                // Reference to the user document
                const userDocRef = doc(db, "users", user.user.uid);
                
                // Get the user document
                const userDoc = await getDoc(userDocRef);
                
                console.log("User document exists:", userDoc.exists());
                
                if (userDoc.exists()) {
                    console.log("Full user data:", userDoc.data()); // Log complete document
                    
                    if (userDoc.data().ownedGames) {
                        const ownedGameIds = userDoc.data().ownedGames;
                        console.log("Owned game IDs:", ownedGameIds); // Debug log
                        
                        if (!Array.isArray(ownedGameIds)) {
                            console.error("ownedGames is not an array:", ownedGameIds);
                            setLoading(false);
                            return;
                        }
                        
                        if (ownedGameIds.length === 0) {
                            console.log("ownedGames array is empty");
                            setLoading(false);
                            return;
                        }
                        
                        // Fetch details for each game from RAWG API
                        const gameDetailsPromises = ownedGameIds.map(async (gameId, index) => {
                            console.log(`Processing game ID at index ${index}:`, gameId);
                            
                            if (!gameId && gameId !== 0) {
                                console.error(`Invalid game ID at index ${index}:`, gameId);
                                return null;
                            }
                            
                            try {
                                const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;
                                console.log("Making API request to:", apiUrl);
                                
                                const response = await axios.get(apiUrl);
                                console.log(`API response status for game ${gameId}:`, response.status);
                                
                                if (!response.data) {
                                    console.error(`No data in response for game ${gameId}`);
                                    return null;
                                }
                                
                                const gameData = response.data;
                                console.log(`Game details for ${gameId}:`, {
                                    id: gameData.id,
                                    name: gameData.name,
                                    image: gameData.background_image
                                });
                                
                                return {
                                    id: gameData.id,
                                    rawgId: gameData.id,
                                    title: gameData.name,
                                    image: gameData.background_image || "/placeholder.svg",
                                    achievements: {
                                        completed: 0,
                                        total: gameData.achievements_count || 0
                                    },
                                    installed: false
                                };
                            } catch (error) {
                                console.error(`Error fetching game with ID ${gameId}:`, error);
                                console.error("Error response:", error.response?.data);
                                return null; // Return null for failed requests
                            }
                        });
                        
                        console.log("Created promises array with length:", gameDetailsPromises.length);
                        
                        const gameDetails = await Promise.all(gameDetailsPromises);
                        console.log("Promise.all resolved with results:", gameDetails);
                        
                        const validGameDetails = gameDetails.filter(game => game !== null);
                        console.log("Valid game details:", validGameDetails);
                        
                        setGames(validGameDetails);
                    } else {
                        console.log("No ownedGames property in user document");
                    }
                } else {
                    console.log("User document does not exist");
                }
            } catch (error) {
                console.error("Error fetching user games:", error);
                if (error.response) {
                    console.error("Error response:", error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserGames();
    }, [RAWG_API_KEY,user.user]);

    const toggleFilter = (filter: string) => {
        setOpenFilters((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdown !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.h-6.w-6')) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdown]);

    return (
        <div className="font-medium bg-[#111111] light:bg-light h-screen flex flex-col fixed inset-0">
            {/* Fixed Navbar at the Top */}
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Fixed Sidebar on the Left */}
                <div className="border-r border-white/5">
                     <Sidebar />
                </div>
               
                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Library Content - This is the only scrollable area */}
                    <div className="h-full overflow-y-auto">
                        <div className="text-white p-6">
                            {/* Keep existing content here */}
                            <header className="flex justify-between items-center mb-6">
                               
                                <div className="flex items-center gap-2">
                                    <h1 className="text-4xl font-bold light:text-black">Library</h1>
                                    <button className="p-2 pt-5 rounded-full light:text-zinc-800 transition-colors">
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
                                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                            <path d="M21 3v5h-5" />
                                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                            <path d="M8 16H3v5" />
                                        </svg>
                                    </button>
                                </div>
                            </header>

                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-col gap-6">
                                        {/* Tabs */}
                                        <div className="w-full">
                                            <div className="flex items-center justify-between text-white light:text-black">
                                                <div className="flex">
                                                    <button
                                                        onClick={() => setActiveTab("all")}
                                                        className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-white light:border-black font-medium" : "text-zinc-400"}`}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveTab("favorites")}
                                                        className={`px-4 py-2 ${activeTab === "favorites" ? "border-b-2 border-white light:border-black font-medium" : "text-zinc-400"}`}
                                                    >
                                                        Favorites
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sort and View Options */}
                                        <div className="flex justify-between items-center h-12 sticky top-0 z-50 bg-[#111111] light:bg-light">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-400 light:text-black">Sort by:</span>
                                                <button className="flex items-center gap-1 text-sm px-2 py-1 hover:bg-gray-800 light:hover:bg-zinc-300 text-white light:text-black rounded transition-colors">
                                                    Alphabetical A-Z
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
                                                        <path d="m6 9 6 6 6-6" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setGridView(true)}
                                                    className={`p-2 rounded-md ${gridView ? "bg-zinc-800 light:bg-zinc-400" : "hover:bg-zinc-800 light:hover:bg-zinc-500"} transition-colors`}
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
                                                        <rect width="7" height="7" x="3" y="3" rx="1" />
                                                        <rect width="7" height="7" x="14" y="3" rx="1" />
                                                        <rect width="7" height="7" x="14" y="14" rx="1" />
                                                        <rect width="7" height="7" x="3" y="14" rx="1" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setGridView(false)}
                                                    className={`p-2 rounded-md ${!gridView ? "bg-zinc-800 light:bg-zinc-400" : "hover:bg-zinc-800 light:hover:bg-zinc-500"} transition-colors`}
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
                                                        <line x1="3" x2="21" y1="6" y2="6" />
                                                        <line x1="3" x2="21" y1="12" y2="12" />
                                                        <line x1="3" x2="21" y1="18" y2="18" />
                                                    </svg>
                                                </button>
                                                <span className="text-lg font-medium ml-2 light:text-black/80">Filters</span>
                                            </div>
                                        </div>

                                        {/* Loading State */}
                                        {loading && (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                            </div>
                                        )}

                                        {/* No Games State */}
                                        {!loading && games.length === 0 && (
                                            <div className="flex flex-col justify-center items-center h-64 text-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="48"
                                                    height="48"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mb-4 text-zinc-500"
                                                >
                                                    <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"></path>
                                                    <circle cx="18" cy="18" r="3"></circle>
                                                    <path d="m19.5 14.5-3 3"></path>
                                                </svg>
                                                <h3 className="text-xl font-medium mb-2 light:text-black">No games found</h3>
                                                <p className="text-zinc-400 light:text-black/70 max-w-md">
                                                    Your library is empty. Visit the store to browse and purchase games.
                                                </p>
                                            </div>
                                        )}

                                        {/* Game Grid */}
                                        {!loading && games.length > 0 && (
                                            <div
                                                className={
                                                    gridView ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" : "space-y-2"
                                                }
                                            >
                                                {games.map((game) => (
                                                    <div
                                                        key={game.id}
                                                        className={`relative group ${!gridView && "flex items-center gap-4 p-2 hover:bg-zinc-800 light:hover:bg-zinc-300 rounded"}`}
                                                    >
                                                        <div className={`relative overflow-hidden rounded-lg ${!gridView && "w-16"}`}>
                                                            <Image
                                                                src={game.image || "/placeholder.svg"}
                                                                alt={game.title}
                                                                width={200}
                                                                height={300}
                                                                className={`w-full h-auto ${gridView ? "aspect-[3/4]" : "aspect-square"} object-cover`}
                                                            />
                                                            {gridView && (
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                                    <button className="w-full py-1.5 px-3 bg-gray-200 text-black rounded text-sm font-medium hover:bg-white transition-colors">
                                                                        {game.installed ? "Play" : "Install"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={gridView ? "mt-2" : "flex-1"}>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-medium text-sm truncate light:text-black">{game.title}</h3>
                                                                <button 
                                                                    onClick={() => setOpenDropdown(openDropdown === game.id ? null : game.id)}
                                                                    className="h-6 w-6 pt-3 flex items-center justify-center -mr-2 text-white light:text-black rounded-full relative"
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
                                                                        <circle cx="12" cy="12" r="1" />
                                                                        <circle cx="12" cy="5" r="1" />
                                                                        <circle cx="12" cy="19" r="1" />
                                                                    </svg>
                                                                    
                                                                    {/* Dropdown Menu */}
                                                                    {openDropdown === game.id && (
                                                                        <div className="absolute right-0 left-6 top-full mt-1 w-48 rounded-xl bg-zinc-800 light:bg-zinc-300 shadow-lg z-50">
                                                                            <div className="py-1">
                                                                                <div className="border-b border-white/10 light:border-black/30 mx-auto w-[90%] pt-1">
                                                                                <div 
                                                                                    onClick={() => {/* Add favorite handler */}} 
                                                                                    className="flex items-center px-4 rounded-lg py-2 text-sm text-gray-300 light:text-black hover:bg-zinc-600 light:hover:bg-zinc-400 cursor-pointer"
                                                                                >
                                                                                    <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                                    </svg>
                                                                                    Add to Favorites
                                                                                </div>
                                                                                </div>
                                                                               <div className="border-b border-white/10 light:border-black/30 mx-auto w-[90%]">
                                                                               <div 
                                                                                    onClick={() => {/* Add install handler */}}
                                                                                    className="flex items-center px-4 rounded-lg py-2 text-sm text-gray-300 light:text-black hover:bg-zinc-600 light:hover:bg-zinc-400 cursor-pointer"
                                                                                >
                                                                                    <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                                    </svg>
                                                                                    Install
                                                                                </div>
                                                                               </div>
                                                                                <div 
                                                                                    onClick={() => {/* Add uninstall handler */}}
                                                                                    className="flex items-center pb-2 mx-auto px-4 w-[90%] rounded-lg py-2 text-sm text-gray-300 light:text-black hover:bg-zinc-600 light:hover:bg-zinc-400 cursor-pointer"
                                                                                >
                                                                                    <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                    Uninstall
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            {game.achievements && (
                                                                <p className="text-xs text-white/70 light:text-black/70 font-medium">
                                                                    {game.achievements.completed}/{game.achievements.total} Achievements
                                                                </p>
                                                            )}
                                                            
                                                        </div>
                                                        {!gridView && (
                                                            <button className="py-1.5 px-3 w-28 bg-zinc-700 hover:bg-zinc-500 rounded text-sm transition-colors">
                                                                {game.installed ? "Play" : "Install"}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Filters Sidebar */}
                                <div className="w-full ml-6 lg:w-60 space-y-4 light:text-black">
                                    <div className="relative">
                                        <svg
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
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
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            className="w-full pl-10 py-2 bg-zinc-800 light:bg-zinc-300 border-none rounded-md text-white light:text-black focus:outline-none focus:ring-1 focus:ring-gray-600"
                                        />
                                    </div>

                                    {Object.keys(openFilters).map((filter) => (
                                        <div key={filter} className="border-b border-gray-800 pb-2">
                                            <button
                                                onClick={() => toggleFilter(filter)}
                                                className="flex w-full items-center justify-between py-2 text-left font-medium"
                                            >
                                                {filter}
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
                                                    className={`transition-transform duration-200 ${openFilters[filter] ? "rotate-180" : ""}`}
                                                >
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </button>
                                            {openFilters[filter] && (
                                                <div className="pt-1 pb-2">
                                                    <div className="space-y-1">
                                                        <div className="px-2 py-1 text-sm hover:bg-gray-800 rounded cursor-pointer">All</div>
                                                        <div className="px-2 py-1 text-sm hover:bg-gray-800 rounded cursor-pointer">Option 1</div>
                                                        <div className="px-2 py-1 text-sm hover:bg-gray-800 rounded cursor-pointer">Option 2</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Library;