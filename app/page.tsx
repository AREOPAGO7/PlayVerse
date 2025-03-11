"use client"
import Image from 'next/image'
import { useState, useRef, useEffect } from "react"
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
  const [activeGameIndex, setActiveGameIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [prevGameIndex, setPrevGameIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const discoverCarouselRef = useRef<HTMLDivElement>(null)
  const freeGamesCarouselRef = useRef<HTMLDivElement>(null)
  const newReleasesCarouselRef = useRef<HTMLDivElement>(null)

  const games = [
    { 
      id: 1, 
      title: "Split Fiction", 
      subtitle: "Base Game",
      new: false,
      img: '/games/split.png',
      bannerDescription: "Experience the thrilling world of Split Fiction. Join millions of players in this action-packed adventure!",
      status: "NEW RELEASE",
      price: "Free",
      banner: '/games/banners/splitfiction.jpeg'
    },
    { 
      id: 2, 
      title: "Grand Theft Auto V", 
      subtitle: "Enhanced", 
      new: false, 
      img: '/games/gta.png',
      bannerDescription: "Los Santos: a sprawling metropolis full of self-help gurus, starlets, and fading celebrities.",
      status: "POPULAR",
      price: "$29.99",
      banner: '/games/banners/gtav.png'
    },
    { 
      id: 3, 
      title: "Red Dead 2", 
      subtitle: "Base Game",
      new: true, 
      img: '/games/red.png',
      bannerDescription: "America, 1899. Experience the epic tale of Arthur Morgan and the Van der Linde gang.",
      status: "FEATURED",
      price: "$59.99",
      banner: '/games/banners/reddead.png'
    },
    { 
      id: 4, 
      title: "Cyber Punk", 
      subtitle: "2.0 Update",
      new: false,
      img: '/games/cyber.png',
      bannerDescription: "Enter the vast open world of Night City in this action-adventure RPG.",
      status: "UPDATED",
      price: "$49.99",
      banner: '/games/banners/cyberpunk.png'
    },
    { 
      id: 5, 
      title: "Black Myth Wukong", 
      subtitle: "Expedition 33", 
      new: false,
      img: '/games/wukong.png',
      bannerDescription: "Embark on a legendary journey inspired by Chinese mythology.",
      status: "COMING SOON",
      price: "$69.99",
      banner: '/games/banners/wukong.png'
    },
    { 
      id: 6, 
      title: "Horizon Zero Dawn", 
      subtitle: "Complete Edition",
      new: false, 
      img: '/games/horizon.png',
      bannerDescription: "Experience Aloy's entire legendary quest to unravel the mysteries of a world ruled by deadly machines.",
      status: "BEST SELLER",
      price: "$49.99",
      banner: '/games/banners/horizon.png'
    },
    
  ]

  const discoverGames = [
    { id: 1, title: "Far cry 3", tag: "NEW", img: '/games/farcry3.png', price: 59.99, discount: 40 },
    { id: 2, title: "Silent Hill 2", tag: "NEW", img: '/games/silenthill.png', price: 49.99, discount: 25 },
    { id: 3, title: "EA FC25", tag: "", img: '/games/fc25.png', price: 69.99 },
    { id: 4, title: "God of war", tag: "WINDOWS 10+ PRE-RELEASE", img: '/games/gow.png', price: 59.99, discount: 33 },
    { id: 5, title: "Forza horizon 5", tag: "", img: '/games/forza.png', price: 59.99 },
    { id: 6, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
    { id: 7, title: "EA FC25", tag: "", img: '/games/fc25.png', price: 69.99 },
    { id: 8, title: "God of war", tag: "WINDOWS 10+ PRE-RELEASE", img: '/games/gow.png', price: 59.99, discount: 33 },
    { id: 9, title: "Forza horizon 5", tag: "", img: '/games/forza.png', price: 59.99 },
    { id: 10, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
    { id: 11, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
    { id: 12, title: "EA FC25", tag: "", img: '/games/fc25.png', price: 69.99 },
    { id: 13, title: "God of war", tag: "WINDOWS 10+ PRE-RELEASE", img: '/games/gow.png', price: 59.99, discount: 33 },
    { id: 14, title: "Forza horizon 5", tag: "", img: '/games/forza.png', price: 59.99 },
    { id: 15, title: "The witcher 3", tag: "", img: '/games/thewitcher3.png', price: 39.99, discount: 50 },
  ]

  const scrollCarousel = (direction: "left" | "right", carouselRef: React.RefObject<HTMLDivElement>) => {
    if (carouselRef.current) {
      const scrollAmount = 300
      const currentScroll = carouselRef.current.scrollLeft
      const newPosition = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const duration = 8000; 
    const interval = 50;
    setProgress(0); 
  
    let elapsed = 0;
    
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (interval / duration) * 100;
        return newProgress >= 100 ? 100 : newProgress; 
      });
      elapsed += interval;
    }, interval);
  
  
    const gameTimer = setTimeout(() => {
      clearInterval(progressTimer);
      setIsTransitioning(true);
  
      setTimeout(() => {
        setPrevGameIndex(activeGameIndex);
        setActiveGameIndex((current) => (current + 1) % games.length);
        setIsTransitioning(false);
      }, 500);
    }, duration);
  
    return () => {
      clearInterval(progressTimer);
      clearTimeout(gameTimer);
    };
  }, [activeGameIndex]);
  
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  return (
    <>
      <Head>
        <title>Play Verse Store</title>
        <meta name="description" content="PlayVerse Games Store " />
        
      </Head>

      <div className="flex flex-col h-screen bg-[#111111] text-white overflow-hidden font-sans">
       <Navbar/>
        <div className="flex flex-1 overflow-hidden ">
       <div className='border-r border-white/5'>
         <Sidebar/>
       </div>
        

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="h-full overflow-auto">
              {/* Featured game banner with right sidebar */}
              <div className="relative px-6 py-4 flex gap-4">
                {/* Main banner - REDUCED WIDTH BY 20% using w-4/5 */}
                <div className="relative h-[400px] md:h-[625px] overflow-hidden xl:w-3/4 w-full rounded-xl">
                  {/* Previous image */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-in-out transform  
                      ${isTransitioning ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
                  >
                    <Image
                      src={games[prevGameIndex].banner}
                      fill
                      alt=""
                      className="object-cover object-center w-full h-full rounded-xl"
                      priority
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      quality={100}
                    />
                  </div>

                  {/* Current image */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-in-out transform
                      ${isTransitioning ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                  >
                    <Image
                      src={games[activeGameIndex].banner}
                      fill
                      alt=""
                      className="object-cover object-center w-full h-full rounded-xl"
                      priority
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      quality={100}
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent rounded-xl" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 p-8 max-w-xl">
                    <div className={`transition-all duration-500 transform
                      ${isTransitioning ? 'translate-x-12 opacity-0' : 'translate-x-0 opacity-100'}`}>
                      <div className="mb-2">
                        <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {games[activeGameIndex].status}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h1 className="text-5xl text-white/90 font-bold tracking-wide mb-2">
                          {games[activeGameIndex].title}
                        </h1>
                        <p className="text-base text-gray-200 leading-relaxed">
                          {games[activeGameIndex].bannerDescription}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span className="text-2xl font-bold">{games[activeGameIndex].price}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="bg-white/95 hover:bg-white  text-black font-semibold px-8 py-3 rounded-lg transition-colors">
                          Buy Now
                        </button>
                        <button className="bg-black/30 backdrop-blur-sm border border-white/20 font-semibold px-6 py-3 rounded hover:bg-white/10 transition-colors">
                          Add to Wishlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar with game thumbnails */}
                <div className="w-[350px] bg-[#111111] hidden xl:block font-medium">
                  <div className="h-full overflow-auto">
                    <div className="p-4">
                      {games.map((game, index) => (
                        <div
                          key={game.id}
                          className={`relative flex items-center p-2 rounded-lg mb-2 cursor-pointer transition-colors overflow-hidden
                            ${activeGameIndex === index ? "bg-[#303030]" : "hover:bg-[#252525]"}`}
                          onClick={() => {
                            setPrevGameIndex(activeGameIndex);
                            setIsTransitioning(true);
                            setActiveGameIndex(index);
                            setProgress(0);
                          }}
                        >
                          {/* Loading indicator overlay */}
                          {activeGameIndex === index && (
                            <div 
                              className="absolute inset-0 bg-white/10 transition-all duration-100"
                              style={{ 
                                width: `${progress}%`,
                              }}
                            />
                          )}

                          {/* Game thumbnail */}
                          <div className="w-16 h-20 relative flex-shrink-0">
                            <Image
                              src={game.img}
                              alt={game.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>

                          {/* Game info */}
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-semibold">{game.title}</h3>
                            {game.subtitle && (
                              <p className="text-xs text-gray-400">{game.subtitle}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                      onClick={() => scrollCarousel("left", discoverCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right", discoverCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={discoverCarouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={`discover-${game.id}-${index}`}
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
                          alt={game.title} 
                          className='rounded-lg object-cover'
                        /> 
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button className="border border-white text-white text-xs px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-colors">
                            View Game
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className={`text-sm ${poppins.className} text-white`}>{game.title}</h3>
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
                      onClick={() => scrollCarousel("left", freeGamesCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right", freeGamesCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={freeGamesCarouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={`free-${game.id}-${index}`}
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
                          alt={game.title} 
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
                      onClick={() => scrollCarousel("left", newReleasesCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors"
                      onClick={() => scrollCarousel("right", newReleasesCarouselRef)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={newReleasesCarouselRef}
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {discoverGames.map((game, index) => (
                    <div
                      key={`new-${game.id}-${index}`}
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
                          alt={game.title} 
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