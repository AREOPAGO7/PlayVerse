"use client"
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Head from "next/head"
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/config";
import Navbar from './components/navigation/Navbar';
// import { useUser } from "./contexts/UserContext";
import {  Github, Instagram, Twitch, Youtube } from "lucide-react"
import { Poppins } from 'next/font/google';
import Sidebar from './components/navigation/Sidebar';
import Spinner from './components/spinners/Spinner';
import { Game, DiscoverGame, RAWGGame, NewGame } from './types/games'
import { FirestoreGame, RAWGSearchResponse, TransformedGame, } from './types/fetch'

import Link from 'next/link';
const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});

// RAWG API key from environment variables
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// Define interfaces for type safety

export default function Store() {
  const [activeGameIndex, setActiveGameIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [, setPrevGameIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const discoverCarouselRef = useRef<HTMLDivElement>(null);
  const newReleasesCarouselRef = useRef<HTMLDivElement>(null);

  // State for storing API data
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [NewGames, setNewGames] = useState<NewGame[]>([]);
  const [discoverGames, setDiscoverGames] = useState<DiscoverGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState({
    featured: false,
    discover: false,
    new: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_error, setError] = useState<string | null>(null);

  // Default games to use as fallback if API fails
  const defaultGames: Game[] = useMemo(() => [
    {
      id: 1,
      title: "Split Fiction",
      subtitle: "Base Game",
      new: false,
      img: '/games/split.png',
      bannerDescription: "Experience the thrilling world of Split Fiction. Join millions of players in this action-packed adventure!",
      status: "NEW RELEASE",
      price: "Free",
      banner: '/games/banners/splitfiction.jpeg',
      discount: undefined,
      originalPrice: undefined
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
      banner: '/games/banners/gtav.png',
      discount: undefined,
      originalPrice: undefined
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
      banner: '/games/banners/reddead.png',
      discount: undefined,
      originalPrice: undefined
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
      banner: '/games/banners/cyberpunk.png',
      discount: undefined,
      originalPrice: undefined
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
      banner: '/games/banners/wukong.png',
      discount: undefined,
      originalPrice: undefined
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
      banner: '/games/banners/horizon.png',
      discount: undefined,
      originalPrice: undefined
    },
  ], []);

  // Default discover games
  const defaultDiscoverGames: DiscoverGame[] = useMemo(() => [
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
  ], []);

  // Fetch featured games from RAWG API
  const fetchFeaturedGames = useCallback(async (): Promise<void> => {
    try {
      const specificGames = [
        "Red Dead Redemption 2",
        "Grand Theft Auto V",
        "Split Fiction",
        "Horizon Zero Dawn",
        "Black Myth: Wukong",
        "Cyberpunk 2077",
      ];

      // Fetch prices and discounts from Firestore
      const gamePricesSnapshot = await getDocs(collection(db, "games"));
      const gamePrices: Record<string, { price: number; discount: number }> = {};
      gamePricesSnapshot.forEach((doc) => {
        const data = doc.data();
        gamePrices[data.name] = {
          price: data.price,
          discount: data.discount || 0,
        };
      });

      // Fetch game details from RAWG API
      const gamePromises = specificGames.map((gameName) =>
        fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameName)}&page_size=1`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data && data.results && data.results.length > 0 ? data.results[0] : null))
          .catch((err) => {
            console.log(`Error fetching ${gameName}:`, err);
            return null;
          })
      );

      const gameResults = await Promise.all(gamePromises);

      // Fallback objects for missing games
      const fallbackGames: Record<string, Game> = {
        "Red Dead Redemption 2": defaultGames[2],
        "Grand Theft Auto V": defaultGames[1],
        "Split Fiction": defaultGames[0],
        "Horizon Zero Dawn": defaultGames[5],
        "Black Myth: Wukong": defaultGames[4],
        "Cyberpunk 2077": defaultGames[3],
      };

      const statuses = ["FEATURED", "POPULAR", "NEW RELEASE", "BEST SELLER", "COMING SOON", "UPDATED"];

      const transformedGames = specificGames.map((gameName, index) => {
        const game = gameResults[index] as RAWGGame | null;

        if (!game) {
          return fallbackGames[gameName];
        }

        // Fetch price and discount from Firestore
        const firestoreData = gamePrices[gameName];
        let basePrice = 39.99;
        let discount = 0;

        if (firestoreData) {
          basePrice = firestoreData.price || basePrice;
          discount = firestoreData.discount || discount;
        }

        // Calculate discounted price
        const priceAfterDiscount = basePrice - (basePrice * discount) / 100;

        return {
          id: game.id,
          title: gameName,
          subtitle: "Base Game",
          new: index === 2,
          img: game.background_image || fallbackGames[gameName].img,
          bannerDescription: game.description_raw
            ? game.description_raw.substring(0, 120) + "..."
            : fallbackGames[gameName].bannerDescription,
          status: statuses[index % statuses.length],
          price: `$${priceAfterDiscount.toFixed(2)}`,
          originalPrice: discount > 0 ? `$${basePrice.toFixed(2)}` : null,
          discount: discount > 0 ? `${discount}% off` : null,
          banner: game.background_image || fallbackGames[gameName].banner,
        };
      });

      setFeaturedGames(transformedGames);
    } catch (err: unknown) {
      const error = err as RTCError;
      console.log("Error fetching featured games:", error);
      setError(error.message);
      setFeaturedGames(defaultGames);
    } finally {
      setDataLoaded(prev => ({ ...prev, featured: true }));
    }
  }, [defaultGames]);

  const fetchDiscoverGames = useCallback(async (): Promise<void> => {
    try {
      // ... existing fetch code ...
    } catch (error: unknown) {
      const err = error as RTCError;
      console.error("Error fetching discover games:", err);
      setError(err.message);
      setDiscoverGames(defaultDiscoverGames);
    } finally {
      setDataLoaded(prev => ({ ...prev, discover: true }));
    }
  }, [defaultDiscoverGames]);

  const fetchNewGames = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=2025-01-01,2025-12-31&ordering=-added&page_size=20`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch new games');
      }

      const data = await response.json();

      // Transform the data into our app's format
      const transformedGames = data.results.map((game: RAWGGame) => {
        const hasDiscount = Math.random() > 0.5;
        const discount = hasDiscount ? [25, 33, 40, 50][Math.floor(Math.random() * 4)] : undefined;
        const basePrice = [39.99, 49.99, 59.99, 69.99][Math.floor(Math.random() * 4)];

        const tags = ["NEW", "WINDOWS 10+ PRE-RELEASE", "", ""];
        const randomTag = tags[Math.floor(Math.random() * tags.length)];

        return {
          id: game.id,
          title: game.name,
          tag: randomTag,
          img: game.background_image,
          price: basePrice,
          discount: discount,
        };
      });

      setNewGames(transformedGames);
    } catch (error: unknown) {
      const err = error as RTCError;
      console.error("Error fetching new games:", err);
      setError(err.message);
      setNewGames(defaultDiscoverGames);
    } finally {
      setDataLoaded(prev => ({ ...prev, new: true }));
    }
  }, [defaultDiscoverGames]);

  // Add effect to check if all data is loaded
  useEffect(() => {
    if (dataLoaded.featured && dataLoaded.discover && dataLoaded.new) {
      setLoading(false);
    }
  }, [dataLoaded]);

  // Scroll carousel function
  const scrollCarousel = (direction: "left" | "right", carouselRef: React.RefObject<HTMLDivElement>): void => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      const newPosition = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFeaturedGames();
    fetchDiscoverGames();
    fetchNewGames();
  }, [fetchFeaturedGames, fetchDiscoverGames, fetchNewGames]);

  // Handle game carousel progress
  useEffect(() => {
    const duration = 8000;
    const interval = 50;
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (interval / duration) * 100;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, interval);

    const gameTimer = setTimeout(() => {
      clearInterval(progressTimer);
      setIsTransitioning(true);

      setTimeout(() => {
        setPrevGameIndex(activeGameIndex);
        setActiveGameIndex((current) => (current + 1) % (featuredGames.length || 1));
        setIsTransitioning(false);
      }, 500);
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(gameTimer);
    };
  }, [activeGameIndex, featuredGames.length]);

  // Handle transitioning state
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#111111] text-white">
        <Spinner />
      </div>
    );
  }

  // Use featuredGames from API if available, otherwise use default
  const games = featuredGames.length > 0 ? featuredGames : defaultGames;

  return (
    <>
      <Head>
        <title>Play Verse Store</title>
        <meta name="description" content="PlayVerse Games Store " />
      </Head>

      <div className="flex flex-col h-screen bg-[#111111] light:bg-light text-white  overflow-hidden font-sans">
        <Navbar />
        <div className="flex flex-1 overflow-hidden ">
          <div className='border-r border-white/5'>
            <Sidebar />
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="h-full overflow-auto">
              {/* Featured game banner with right sidebar */}
              <div className="relative px-6 py-4 flex gap-4">
                {/* Main banner - REDUCED WIDTH BY 20% using w-4/5 */}
                <div className="relative h-[400px] md:h-[480px] overflow-hidden xl:w-3/4 w-full rounded-xl">
                  {/* Previous image */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-in-out transform  
                      ${isTransitioning ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
                  >
                    <Image
                      src={games[activeGameIndex]?.banner || '/games/banners/placeholder.jpg'}
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
                      src={games[activeGameIndex]?.banner || '/games/banners/placeholder.jpg'}
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
                        <span className="text-[8px] font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {games[activeGameIndex]?.status || 'FEATURED'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h1 className="text-3xl text-white/90 font-bold tracking-wide mb-1">
                          {games[activeGameIndex]?.title || 'Game Title'}
                        </h1>
                        <p className="text-[13px] text-gray-200 leading-relaxed">
                          {games[activeGameIndex]?.bannerDescription || 'Game description not available.'}
                        </p>
                      </div>
                      <div className="mb-2  items-center gap-3">
                        <div className='mb-1'>
                          {games[activeGameIndex]?.discount && (
                            <span className="bg-green-500 text-white text-sm px-2 py-0.5 rounded">
                              -{games[activeGameIndex].discount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {games[activeGameIndex]?.discount && (
                            <span className="text-lg text-gray-400 line-through">
                              {games[activeGameIndex].originalPrice}
                            </span>
                          )}
                          <span className="text-xl font-bold">
                            {games[activeGameIndex]?.price || '$49.99'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">

                        <Link
                          href={`/pages/game/${games[activeGameIndex]?.id}?price=${encodeURIComponent(games[activeGameIndex]?.price || '0')}`}
                          className="bg-white/95 hover:bg-white text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                        >
                          Buy Now
                        </Link>
                        <button className="bg-black/30 backdrop-blur-sm text-[14px] border border-white/20 font-semibold px-4 py-2 rounded hover:bg-white/10 transition-colors">
                          Add to Wishlist
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right sidebar with game thumbnails */}
                <div className="w-[350px] bg-[#111111] hidden xl:block font-medium light:bg-light light:text-black ">
                  <div className="h-full overflow-auto">
                    <div className="p-4">
                      {games.map((game, index) => (
                        <div
                          key={game.id}
                          className={`relative flex items-center p-2 rounded-lg mb-2 cursor-pointer transition-colors overflow-hidden border border-black/10
                            ${activeGameIndex === index ? "bg-[#303030] light:bg-zinc-300" : "hover:bg-[#252525] light:hover:bg-zinc-300"}`}
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
                              className="absolute inset-0 bg-white/10 light:bg-black/20 transition-all duration-100"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          )}

                          {/* Game thumbnail */}
                          <div className="w-12  h-[54px] relative flex-shrink-0">
                            <Image
                              src={game.img || '/games/placeholder.jpg'}
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
                  <h2 className="text-xl font-bold light:text-black">Discover Something New</h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors light:bg-zinc-300 light:hover:bg-zinc-300"
                      onClick={() => {
                        if (discoverCarouselRef.current) {
                          scrollCarousel("left", discoverCarouselRef as React.RefObject<HTMLDivElement>)
                        }
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors light:bg-zinc-300 light:hover:bg-zinc-300"
                      onClick={() => {
                        if (discoverCarouselRef.current) {
                          scrollCarousel("right", discoverCarouselRef as React.RefObject<HTMLDivElement>)
                        }
                      }}
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
                    <Link
                      href={`/pages/game/${game.id}?price=${encodeURIComponent(typeof game.discountedPrice === 'number' ? game.discountedPrice.toFixed(2) : typeof game.price === 'number' ? game.price.toFixed(2) : '0')}&discount=${encodeURIComponent(game.discount || 0)}`}
                      key={`discover-${game.id}-${index}`}
                      className="flex-shrink-0 w-[240px] rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative aspect-[4/4] h-[300px]">
                        {game.tag && (
                          <div className="absolute top-2 left-2 bg-white text-black text-[10px] px-1.5 py-0.5 font-bold rounded light:text-black">
                            {game.tag}
                          </div>
                        )}
                        <Image
                          src={game.img || '/games/placeholder.jpg'}
                          fill
                          alt={game.title}
                          className="rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 w-[80%] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10">
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className={`text-sm ${poppins.className} text-white h-10 light:text-black`}>{game.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 light:text-black">Base Game</p>
                        <div className="mt-2 flex items-center gap-2">

                          {game.discount !== null && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 font-bold rounded">
                              -{game.discount}%
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {/* Show original price with strikethrough if discount exists */}
                            {game.discount !== undefined && (
                              <span className="text-xs text-gray-400 line-through light:text-black">
                                ${game.price.toFixed(2)} {/* Show the original price */}
                              </span>
                            )}
                            {/* Show discounted price if discount exists, otherwise show the original price */}
                            <span className="text-sm text-white font-medium light:text-black">
                              ${game.discount !== undefined ?
                                (typeof game.discountedPrice === 'number' ? game.discountedPrice.toFixed(2) : game.discountedPrice) :
                                (typeof game.price === 'number' ? game.price.toFixed(2) : game.price)}
                            </span>
                          </div>
                        </div>

                      </div>
                    </Link>
                  ))}
                </div>
              </div>




              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold light:text-black">New Releases</h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors light:bg-zinc-300 light:hover:bg-zinc-300"
                      onClick={() => {
                        if (newReleasesCarouselRef.current) {
                          scrollCarousel("left", newReleasesCarouselRef as React.RefObject<HTMLDivElement>)
                        }
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-[#303030] hover:bg-[#404040] transition-colors light:bg-zinc-300 light:hover:bg-zinc-300"
                      onClick={() => {
                        if (newReleasesCarouselRef.current) {
                          scrollCarousel("right", newReleasesCarouselRef as React.RefObject<HTMLDivElement>)
                        }
                      }}
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
                  {NewGames.map((game, index) => (
                    <Link
                      href={`/pages/game/${game.id}`}
                      key={`discover-${game.id}-${index}`}
                      className="flex-shrink-0 w-[240px] rounded-lg overflow-hidden group cursor-pointer "
                    >
                      <div className="relative aspect-[4/4] h-[300px]">
                        {game.tag && (
                          <div className="absolute top-2 left-2 bg-white text-black text-[10px] px-1.5 py-0.5 font-bold rounded light:text-black">
                            {game.tag}
                          </div>
                        )}
                        <Image
                          src={game.img || '/games/placeholder.jpg'}
                          fill
                          alt={game.title}
                          className='rounded-lg object-cover'
                        />
                        <div className="absolute inset-0 w-[80%] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10">

                        </div>
                      </div>
                      <div className="mt-2 ">
                        <h3 className={`text-sm ${poppins.className} text-white h-10 light:text-black`}>{game.title}</h3>

                        <div className="mt-2 flex items-center gap-2">
                          <span className='bg-green-500 text-[11px] rounded-xl w-[5.3rem] text-center font-bold p-[0.20rem]'>coming soon</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div className="container mx-auto px-4 ">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 mb-6">
                    <div className="text-sm order-3 md:order-1 text-center md:text-left mt-4 md:mt-0">
                      <p>©2025 PlayeVerse </p>
                    </div>
                    <div className="order-1 md:order-2 text-center">
                      <ul className="flex justify-center items-center gap-8 text-md font-bold">
                        <li>
                          <Link href="#" className="hover:text-green-500 transition-colors">
                            GAMES
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="hover:text-green-500 transition-colors">
                            SHOP
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="hover:text-green-500 transition-colors">
                            SUPPORT
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Social Media Links on the right */}
                    <div className="flex justify-center md:justify-end space-x-6 order-2 md:order-3 mt-4 md:mt-0">
                      <Link href="#" className="hover:text-text-green-500 transition-colors" aria-label="Twitch">
                        <Twitch className="w-5 h-5" />
                      </Link>
                      <Link href="#" className="hover:text-text-green-500 transition-colors" aria-label="Youtube">
                        <Youtube className="w-5 h-5" />
                      </Link>
                      <Link href="#" className="hover:text-text-green-500 transition-colors" aria-label="Discord">
                        <Github className="w-5 h-5" />
                      </Link>
                      <Link href="#" className="hover:text-text-green-500 transition-colors" aria-label="Instagram">
                        <Instagram className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
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