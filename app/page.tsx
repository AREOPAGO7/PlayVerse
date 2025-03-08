"use client"
import Image from 'next/image'
import { useState, useRef } from "react"
import Head from "next/head"
import Navbar from './components/navigation/Navbar';
import { useUser } from "./contexts/UserContext";
import { Poppins } from 'next/font/google';
import Sidebar from './components/navigation/Sidebar';


const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});



export default function Store() {
  const user = useUser()
  const [activeGame, setActiveGame] = useState("Wuthering Waves")
  const [scrollPosition, setScrollPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
console.log(user)
  const games = [
    { id: 1, title: "Split Fiction", new: false ,img : '/games/split.png'},
    { id: 2, title: "Grand Theft Auto V", subtitle: "Enhanced", new: false, price: true ,img : '/games/gta.png'},
    { id: 3, title: "Red Dead 2", new: true , img: '/games/red.png'},
    { id: 4, title: "Cyber Punk", new: false ,img:'/games/cyber.png'},
    { id: 5, title: "Black Myth Wukong", subtitle: "Expedition 33", new: false  ,img:'/games/wukong.png'},
    { id: 6, title: "Horizon zero down", new: false, img:'/games/horizon.png'  },
  ]

  const discoverGames = [
    { id: 1, title: "Far cry 3", tag: "NEW", img: '/games/farcry3.png', price: 59.99, discount: 40 },
    { id: 2, title: "Silent Hill 2", tag: "NEW", img: '/games/silenthill.png', price: 49.99, discount: 25 },
    { id: 3, title: "EA FC25", tag: "", img: '/games/fc25.png', price: 69.99 },
    { id: 4, title: "God of war", tag: "WINDOWS 10+ PRE-RELEASE", img: '/games/gow.png', price: 59.99, discount: 33 },
    { id: 5, title: "Forza horizon 5", tag: "", img: '/games/forza.png', price: 59.99 },
    { id: 6, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
    { id: 3, title: "EA FC25", tag: "", img: '/games/fc25.png', price: 69.99 },
    { id: 4, title: "God of war", tag: "WINDOWS 10+ PRE-RELEASE", img: '/games/gow.png', price: 59.99, discount: 33 },
    { id: 5, title: "Forza horizon 5", tag: "", img: '/games/forza.png', price: 59.99 },
    { id: 6, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
  ]

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300
      const newPosition = direction === "left" ? scrollPosition - scrollAmount : scrollPosition + scrollAmount

      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })

      setScrollPosition(newPosition)
    }
  }

  return (
    <>
      <Head>
        <title>Play Verse Store</title>
        <meta name="description" content="PlayVerse Games Store " />
        
      </Head>

      <div className="flex flex-col h-screen bg-[#111111] text-white overflow-hidden font-sans">
       <Navbar/>
        <div className="flex flex-1 overflow-hidden">
       
         <Sidebar/>

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="h-full overflow-auto">
              {/* Featured game banner */}
              <div className="relative">
                <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-[#1a1a2e] to-[#16213e] overflow-hidden">
                  {/* Diagonal line */}
                  <div className="absolute h-[200%] w-1 bg-white/30 transform rotate-[15deg] left-1/2 -translate-x-1/2 top-[-50%]"></div>

                  {/* Left side character silhouette */}
                  <div className="absolute left-[15%] bottom-0 w-[300px] h-[450px] opacity-30">
                    <div className="absolute bottom-0 w-full h-[70%] bg-gradient-to-t from-[#1a1a2e] to-transparent"></div>
                  </div>

                  {/* Right side character silhouette */}
                  <div className="absolute right-[10%] bottom-0 w-[350px] h-[450px] opacity-30">
                    <div className="absolute bottom-0 w-full h-[70%] bg-gradient-to-t from-[#16213e] to-transparent"></div>
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-xl">
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold tracking-wider uppercase mb-2">WUTHERING WAVES</h1>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-bold bg-green-500 px-2 py-1 rounded">NEW UPDATE</span>
                  </div>
                  <p className="text-sm md:text-base mb-4">
                    Version 2.1 "Waves Sing, and the Cerulean Bird Calls" is here! Join to convene 5-star Resonators
                    "Brant" and "Changli"!
                  </p>
                  <div className="mb-4">
                    <span className="font-bold">Free</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-white text-black hover:bg-gray-200 font-bold px-6 py-2 rounded-sm transition-colors">
                      Play For Free
                    </button>
                    <button className="border border-white font-semibold  flex items-center gap-2 rounded-sm px-4 py-2 hover:bg-white/10 transition-colors">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              </div>

              {/* Discover Something New section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Discover Something New</h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("left")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[180px] rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] h-[240px]">
                        {game.tag && (
                          <div className="absolute top-2 left-2 bg-white text-black text-[10px] px-1.5 py-0.5 font-bold rounded">
                            {game.tag}
                          </div>
                        )}
                        <Image 
                          src={game.img || ''} 
                          fill
                          alt='' 
                          className='rounded-lg object-cover'
                        /> 
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button className="border border-white text-white text-xs px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-colors">
                            View Game
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-white">{game.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">Base Game</p>
                        <div className="mt-2 flex items-center gap-2">
                          {game.discount && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 font-bold rounded">
                              -{game.discount}%
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {game.discount && (
                              <span className="text-xs text-gray-400 line-through">
                                ${game.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm text-white font-medium">
                              ${((game.price * (100 - (game.discount || 0))) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Free Games</h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("left")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[180px] rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] h-[240px]">
                        {game.tag && (
                          <div className="absolute top-2 left-2 bg-white text-black text-[10px] px-1.5 py-0.5 font-bold rounded">
                            {game.tag}
                          </div>
                        )}
                        <Image 
                          src={game.img || ''} 
                          fill
                          alt='' 
                          className='rounded-lg object-cover'
                        /> 
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button className="border border-white text-white text-xs px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-colors">
                            View Game
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-white">{game.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">Base Game</p>
                        <div className="mt-2 flex items-center gap-2">
                          {game.discount && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 font-bold rounded">
                              -{game.discount}%
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {game.discount && (
                              <span className="text-xs text-gray-400 line-through">
                                ${game.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm text-white font-medium">
                              ${((game.price * (100 - (game.discount || 0))) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Top New Releases</h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("left")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right")}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[180px] rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] h-[240px]">
                        {game.tag && (
                          <div className="absolute top-2 left-2 bg-white text-black text-[10px] px-1.5 py-0.5 font-bold rounded">
                            {game.tag}
                          </div>
                        )}
                        <Image 
                          src={game.img || ''} 
                          fill
                          alt='' 
                          className='rounded-lg object-cover'
                        /> 
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button className="border border-white text-white text-xs px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-colors">
                            View Game
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-white">{game.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">Base Game</p>
                        <div className="mt-2 flex items-center gap-2">
                          {game.discount && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 font-bold rounded">
                              -{game.discount}%
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {game.discount && (
                              <span className="text-xs text-gray-400 line-through">
                                ${game.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm text-white font-medium">
                              ${((game.price * (100 - (game.discount || 0))) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-[250px] bg-[#111111] hidden xl:block border-l border-[#2a2a2a] font-medium">
            <div className="h-full overflow-auto">
              <div className="p-4">
                {games.map((game, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-2 rounded-lg mb-2 cursor-pointer transition-colors ${
                      activeGame === game.title ? "bg-[#303030]" : "hover:bg-[#252525]"
                    }`}
                    onClick={() => setActiveGame(game.title)}
                  >
                    <div className="relative w-12 h-16 mr-3 bg-gradient-to-br from-[#333] to-[#222] rounded flex items-center justify-center overflow-hidden">
                      {/* Game thumbnail placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                       <Image src={game.img || ''} width={100} height={200} alt={''}></Image>
                      </div>

                     
                    </div>
                    <div className="text-sm">
                      {game.subtitle ? (
                        <>
                          <div>{game.title}</div>
                          <div className="text-gray-400">{game.subtitle}</div>
                        </>
                      ) : (
                        game.title
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

