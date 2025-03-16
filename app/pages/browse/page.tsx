"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "../../components/navigation/Navbar";
import Sidebar from "../../components/navigation/Sidebar";
import Link from "next/link";

interface Game {
    id: number
    name: string
    background_image: string
    achievements_count?: number
    added_by_status?: {
        owned?: number
    }
    metacritic?: number
    released?: string
    genres?: { id: number, name: string }[]
    installed?: boolean
    price?: number // Add price field
    priceTag?: string
}

interface RAWGResponse {
    count: number
    next: string | null
    previous: string | null
    results: Game[]
}

const GAME_PRICES = [
    { price: 69.99, tag: "Premium" },
    { price: 59.99, tag: "Standard" },
    { price: 49.99, tag: "Special" },
    { price: 39.99, tag: "Basic" },
    { price: 19.99, tag: "Budget" }
] as const;

const Browse = () => {
    const [activeTab, setActiveTab] = useState("all")
    const [gridView, setGridView] = useState(true)
    const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
        "Installed": false,
        Genre: false,
        Features: false,
        Types: false,
        Platform: false,
    })
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(20)
    const [games, setGames] = useState<Game[]>([])
    const [totalGames, setTotalGames] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [selectedGenre, setSelectedGenre] = useState<string>("")
    const [genres, setGenres] = useState<{id: number, name: string}[]>([])
    const [sortOrder, setSortOrder] = useState("-added")
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);

    const API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY

    const fetchGames = async (page: number, search?: string, genre?: string) => {
        setIsLoading(true)
        setError("")
        
        try {
            let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&page_size=${itemsPerPage}&ordering=${sortOrder}`
            
            if (search && search.trim() !== "") {
                url += `&search=${encodeURIComponent(search)}`
            }
            
            if (genre && genre !== "") {
                url += `&genres=${genre}`
            }
            
            const response = await fetch(url)
            
            if (!response.ok) {
                throw new Error(`Error fetching games: ${response.status}`)
            }
            
            const data: RAWGResponse = await response.json()
            const gamesWithPrices = data.results.map(game => {
                const randomPriceIndex = Math.floor(Math.random() * GAME_PRICES.length)
                const { price, tag } = GAME_PRICES[randomPriceIndex]
                return {
                    ...game,
                    price,
                    priceTag: tag
                }
            })
            setGames(gamesWithPrices)
            setTotalGames(data.count)
        } catch (err) {
            setError(`Failed to fetch games: ${err instanceof Error ? err.message : String(err)}`)
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGenres = async () => {
        try {
            const response = await fetch(`https://api.rawg.io/api/genres?key=${API_KEY}`)
            
            if (!response.ok) {
                throw new Error(`Error fetching genres: ${response.status}`)
            }
            
            const data = await response.json()
            setGenres(data.results)
        } catch (err) {
            console.error("Failed to fetch genres:", err)
        }
    }

    useEffect(() => {
        fetchGames(currentPage, searchQuery, selectedGenre)
    }, [currentPage, selectedGenre, sortOrder])

    useEffect(() => {
        fetchGenres()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdown !== null) {
                const target = event.target as HTMLElement
                if (!target.closest('.h-6.w-6')) {
                    setOpenDropdown(null)
                }
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [openDropdown])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        
        // Debounce search to avoid too many API calls
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        
        const timeout = setTimeout(() => {
            setCurrentPage(1) // Reset to first page on new search
            fetchGames(1, query, selectedGenre)
        }, 500)
        
        setSearchTimeout(timeout)
    }

    const handleGenreChange = (genreId: string) => {
        setSelectedGenre(genreId)
        setCurrentPage(1) // Reset to first page on genre change
    }

    const handleSortChange = (order: string) => {
        setSortOrder(order)
        setCurrentPage(1) // Reset to first page on sort change
    }

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        window.scrollTo(0, 0) // Scroll to top when changing page
    }

    const toggleFilter = (filter: string) => {
        setOpenFilters((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }))
    }

    const getPageButtons = () => {
        const totalPages = Math.ceil(totalGames / itemsPerPage)
        const maxPageButtons = 5
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
        const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1)
        }
        
        const pageButtons = []
        
        // First page
        if (startPage > 1) {
            pageButtons.push(
                <li key="first">
                    <button
                        onClick={() => paginate(1)}
                        className="px-3 py-1 mx-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 light:bg-zinc-300 light:text-black/80"
                    >
                        1
                    </button>
                </li>
            )
            
            if (startPage > 2) {
                pageButtons.push(<li key="ellipsis1" className="px-3 py-1 mx-1 text-zinc-400">...</li>)
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <li key={i}>
                    <button
                        onClick={() => paginate(i)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-zinc-800 text-white light:bg-zinc-400 light:text-black/80' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 light:bg-zinc-300 light:text-black/80'}`}
                    >
                        {i}
                    </button>
                </li>
            )
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageButtons.push(<li key="ellipsis2" className="px-3 py-1 mx-1 text-zinc-400 light:text-black/80">...</li>)
            }
            
            pageButtons.push(
                <li key="last">
                    <button
                        onClick={() => paginate(totalPages)}
                        className="px-3 py-1 mx-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 light:bg-zinc-300 light:text-black/80"
                    >
                        {totalPages}
                    </button>
                </li>
            )
        }
        
        return pageButtons
    }

    return (
        <div className="font-medium bg-[#111111] light:bg-light h-screen flex flex-col fixed inset-0">
            {/* Fixed Navbar at the Top */}
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                <div className="border-r border-white/5">
                     <Sidebar />
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Library Content - This is the only scrollable area */}
                    <div className="h-full overflow-y-auto">
                        <div className="text-white p-6">
                            <header className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-4xl font-bold light:text-black/80 ">Browse Games</h1>
                                    {isLoading && (
                                        <div className="animate-spin ml-4 h-5 w-5 text-white light:text-black">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-zinc-400 light:text-black/80">
                                    {totalGames > 0 && !isLoading && (
                                        <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalGames)} of {totalGames.toLocaleString()} games</span>
                                    )}
                                </div>
                            </header>

                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-col gap-6">
                                        {/* Sort and View Options */}
                                        <div className="flex justify-between items-center h-12 sticky top-0 z-50 bg-[#111111] light:bg-light">
                                            <div className="flex items-center gap-2 light:text-black/80">
                                                <span className="text-sm text-zinc-400 light:text-black/80 ">Sort by:</span>
                                                <div className="relative group">
                                                    <button 
                                                        onClick={() => setSortDropdownVisible(!sortDropdownVisible)}
                                                        className="flex items-center gap-1 text-sm px-2 py-1 hover:bg-zinc-800 light:hover:bg-zinc-300 rounded transition-colors"
                                                    >
                                                        {sortOrder === "-metacritic" ? "Top Rated" :
                                                         sortOrder === "-released" ? "Newest" :
                                                         sortOrder === "-price" ? "Price: High to Low" :
                                                         sortOrder === "price" ? "Price: Low to High" :
                                                         "Popular"}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="m6 9 6 6 6-6" />
                                                        </svg>
                                                    </button>
                                                    {sortDropdownVisible && (
                                                        <div className="absolute left-0 top-full mt-1 w-40 rounded-md bg-zinc-800 shadow-lg z-50 light:bg-light light:text-black">
                                                            <div className="py-1 ">
                                                                <button 
                                                                    onClick={() => {
                                                                        handleSortChange("-added");
                                                                        setSortDropdownVisible(false);
                                                                    }} 
                                                                    className={`block px-4 py-2 text-sm text-zinc-300 light:text-black hover:bg-zinc-700 light:hover:bg-zinc-300  w-full text-left ${sortOrder === "-added" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                                >
                                                                    Popular
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        handleSortChange("-released");
                                                                        setSortDropdownVisible(false);
                                                                    }} 
                                                                    className={`block px-4 py-2 text-sm text-zinc-300 light:text-black hover:bg-zinc-700 light:hover:bg-zinc-300  w-full text-left ${sortOrder === "-released" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                                >
                                                                    Newest
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        handleSortChange("-metacritic");
                                                                        setSortDropdownVisible(false);
                                                                    }} 
                                                                    className={`block px-4 py-2 text-sm text-zinc-300 light:text-black hover:bg-zinc-700 light:hover:bg-zinc-300  w-full text-left ${sortOrder === "-metacritic" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                                >
                                                                    Top Rated
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const sortedGames = [...games].sort((a, b) => (b.price || 0) - (a.price || 0));
                                                                        setGames(sortedGames);
                                                                        setSortOrder("-price");
                                                                        setSortDropdownVisible(false);
                                                                    }} 
                                                                    className={`block px-4 py-2 text-sm text-zinc-300 light:text-black hover:bg-zinc-700 light:hover:bg-zinc-300  w-full text-left ${sortOrder === "-price" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                                >
                                                                    Price: High to Low
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const sortedGames = [...games].sort((a, b) => (a.price || 0) - (b.price || 0));
                                                                        setGames(sortedGames);
                                                                        setSortOrder("price");
                                                                        setSortDropdownVisible(false);
                                                                    }} 
                                                                    className={`block px-4 py-2 text-sm text-zinc-300 light:text-black hover:bg-zinc-700 light:hover:bg-zinc-300  w-full text-left ${sortOrder === "price" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                                >
                                                                    Price: Low to High
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setGridView(true)}
                                                    className={`p-2 rounded-md ${gridView ? "bg-zinc-800 light:bg-zinc-300 light:text-black/80" : "hover:bg-zinc-800 light:hover:bg-zinc-300 light:text-black/80"} transition-colors`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => setGridView(false)}
                                                    className={`p-2 rounded-md ${!gridView ? "bg-zinc-800 light:bg-zinc-300 light:text-black/80" : "hover:bg-zinc-800 light:hover:bg-zinc-300 light:text-black/80"} transition-colors`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="p-4 mb-4 text-sm text-red-500 bg-red-100/10 rounded-md light:text-red-500 light:bg-red-100/10">
                                                {error}
                                            </div>
                                        )}

                                        {/* Game Grid */}
                                        {isLoading && games.length === 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {[...Array(10)].map((_, i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="h-64 bg-zinc-800 rounded-lg"></div>
                                                        <div className="h-4 bg-zinc-800 rounded mt-2 w-3/4"></div>
                                                        <div className="h-3 bg-zinc-800 rounded mt-1 w-1/2"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className={gridView ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" : "space-y-2"}>
                                                {games.map((game) => (
                                                    <div
                                                        key={game.id}
                                                        className={`relative group ${!gridView && "flex items-center gap-4 p-2 hover:bg-zinc-800 rounded light:hover:bg-zinc-300"}`}
                                                    >
                                                        <div className={`relative overflow-hidden rounded-lg ${!gridView && "w-16"}`}>
                                                            <Image 
                                                                src={game.background_image || "/placeholder.svg"} 
                                                                alt={game.name} 
                                                                width={500} 
                                                                height={500}
                                                                className={`w-full h-auto ${gridView ? "aspect-[3/4]" : "aspect-square"} object-cover`} 
                                                            />
                                                            {gridView && (
                                                                <div className="absolute inset-0 bg-gradient-to-t text-center from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                                    <Link href={`/pages/game/${game?.id}`} className="w-full py-1.5 px-3 bg-zinc-200 text-black rounded text-sm font-medium hover:bg-white transition-colors">
                                                                        {game.installed ? "Play" : "Install"}
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={gridView ? "mt-2" : "flex-1"}>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-medium text-sm truncate light:text-black/80">{game.name}</h3>
                                                               
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {game.metacritic && (
                                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                                        game.metacritic >= 75 ? 'bg-green-500/20 text-green-400' : 
                                                                        game.metacritic >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                                                                        'bg-red-500/20 text-red-400 light:text-red-400'
                                                                    }`}>
                                                                        {game.metacritic}
                                                                    </span>
                                                                )}
                                                                {game.released && (
                                                                    <p className="text-xs text-white/70 font-medium light:text-black/80">
                                                                        {new Date(game.released).getFullYear()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {game.genres && game.genres.length > 0 && (
                                                                <p className="text-xs text-white/70 font-medium mt-1 truncate light:text-black/80">
                                                                    {game.genres.slice(0, 2).map(g => g.name).join(', ')}
                                                                </p>
                                                            )}
                                                            {/* Add price display */}
                                                            <div className="flex items-center justify-between mt-1 light:text-black/80">
                                                                <p className="text-sm font-semibold ">
                                                                    ${game.price?.toFixed(2)}
                                                                </p>
                                                                {game.priceTag && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-zinc-700 light:bg-zinc-300 light:text-black/40 text-zinc-300 rounded    ">
                                                                        {game.priceTag}
                                                                    </span>
                                                                )}
                                                            </div>
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

                                        {/* Pagination */}
                                        {totalGames > itemsPerPage && (
                                            <div className="flex justify-center mt-6">
                                                <nav>
                                                    <ul className="flex list-style-none">
                                                        {/* Previous Button */}
                                                        <li>
                                                            <button
                                                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                className={`px-3 py-1 mx-1 rounded ${
                                                                    currentPage === 1 ? 'bg-zinc-900 light:bg-zinc-300 text-zinc-500 cursor-not-allowed light:text-zinc-500' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 light:hover:bg-zinc-300'
                                                                }`}
                                                            >
                                                                &laquo;
                                                            </button>
                                                        </li>
                                                        
                                                        {/* Page Numbers */}
                                                        {getPageButtons()}
                                                        
                                                        {/* Next Button */}
                                                        <li>
                                                            <button
                                                                onClick={() => currentPage < Math.ceil(totalGames / itemsPerPage) && paginate(currentPage + 1)}
                                                                disabled={currentPage === Math.ceil(totalGames / itemsPerPage)}
                                                                className={`px-3 py-1 mx-1 rounded light:bg-zinc-300 ${
                                                                    currentPage === Math.ceil(totalGames / itemsPerPage) ? 'bg-zinc-900 light:bg-zinc-800 text-zinc-500 cursor-not-allowed light:text-zinc-500' : 'bg-zinc-700 text-zinc-600 hover:bg-zinc-600 light:hover:bg-zinc-300'
                                                                }`}
                                                            >
                                                                &raquo;
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Filters Sidebar */}
                                <div className="w-full lg:w-60 space-y-4">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search games..."
                                            className="w-full pl-10 py-2 bg-zinc-800 border-none rounded-md text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 light:bg-zinc-300 light:text-black/80"
                                        />
                                    </div>

                                    {/* Genres Filter */}
                                    <div className="border-b border-zinc-800 pb-2 light:border-zinc-300">
                                        <button
                                            onClick={() => toggleFilter("Genre")}
                                            className="flex w-full items-center justify-between py-2 text-left font-medium light:text-black/80"
                                        >
                                            Genre
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openFilters["Genre"] ? "rotate-180" : ""}`}>
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>
                                        {openFilters["Genre"] && (
                                            <div className="pt-1 pb-2 max-h-64 overflow-y-auto light:text-black/80 ">
                                                <div className="space-y-1">
                                                    <div 
                                                        className={`px-2 py-1 text-sm hover:bg-zinc-800 rounded cursor-pointer ${selectedGenre === "" ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                        onClick={() => handleGenreChange("")}
                                                    >
                                                        All Genres
                                                    </div>
                                                    {genres.map(genre => (
                                                        <div 
                                                            key={genre.id}
                                                            className={`px-2 py-1 text-sm hover:bg-zinc-800 light:hover:bg-zinc-300 rounded cursor-pointer light:text-black/80  ${selectedGenre === genre.id.toString() ? "bg-zinc-700 light:bg-zinc-300" : ""}`}
                                                            onClick={() => handleGenreChange(genre.id.toString())}
                                                        >
                                                            {genre.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Other Filters */}
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Browse;