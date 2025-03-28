"use client";
import { Poppins } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthPopup from '../Auth/AuthPopup';
import ProfileModel from '@/app/components/models/ProfileModel';
import { useUser } from "../../contexts/UserContext";
import Link from 'next/link';
import Image from 'next/image';
import NotificationPopup from './NotificationPopup';
import { usePathname } from "next/navigation";
// import ChatPopup from '../chatbot/ChatExample';

interface Game {
  id: string | number;
  title: string;
  banner: string;
  price: string | number;
  img?: string;
  bannerDescription?: string;
  status?: string;
  discount?: string;
  originalPrice?: string;
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});

export default function Navbar() {
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const toggleAuth = () => {
    setIsSignUp(!isSignUp);
  };
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItemsCount(cart.length);
  
    // Listen for cart updates
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItemsCount(updatedCart.length);
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  // Update the searchGames function
  const searchGames = (term: string) => {
    setSearchTerm(term);
    
    // Get games from both featured and discover cache
    const featuredCache = localStorage.getItem('featuredGamesCache');
    const discoverCache = localStorage.getItem('discoverGamesCache');
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
  
    let allGames: Game[] = [];
  
    // Add featured games
    if (featuredCache) {
      const { data: featuredData } = JSON.parse(featuredCache);
      allGames = [...allGames, ...featuredData];
    }
  
    // Add discover games
    if (discoverCache) {
      const { data: discoverData } = JSON.parse(discoverCache);
      // Add this interface near the top with the other interfaces
      interface DiscoverGameData {
        id: string | number;
        title: string;
        price: number;
        discount?: number;
        img?: string;
        banner?: string;
      }
      
      // Update the mapping section in searchGames function
      const formattedDiscoverGames = discoverData.map((game: DiscoverGameData) => ({
        ...game,
        price: typeof game.price === 'number' ? `$${game.price.toFixed(2)}` : game.price,
        discount: game.discount ? `${game.discount}% OFF` : undefined,
        originalPrice: game.discount ? `$${game.price}` : undefined,
        banner: game.img || game.banner
      }));
      allGames = [...allGames, ...formattedDiscoverGames];
    }
  
    // Remove duplicates based on game title
    const uniqueGames = Array.from(new Map(allGames.map(game => [game.title, game])).values());
  
    // Filter and sort results
    const filtered = uniqueGames.filter((game: Game) => 
      game.title.toLowerCase().includes(term.toLowerCase())
    );
  
    setSearchResults(filtered.slice(0, 5));
  };

  // Replace the search input section
  return (
    <header className="flex items-center px-4 py-3 bg-[#111111] light:bg-light border-b border-white/10 light:border-gray-200">
      {/* <ChatPopup /> */}
      <div className="flex items-center">
        <Link href="/" className="mr-40">
          <div className="rounded flex items-center justify-center">
            <Image src='/logo.png' width={120} height={120} alt={''} className='ml-4' />
          </div>
        </Link>
        <button className="p-2 mr-2 rounded-full hover:bg-[#303030] lg:flex hidden">
        </button>
        <div className="relative">
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-opacity ${searchFocused ? "opacity-0" : "opacity-100"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => searchGames(e.target.value)}
            placeholder="Search store"
            className={`pl-10 bg-[#303030] light:bg-gray-100 light:text-black light:border border-zinc-400 light:placeholder:text-black/50 text-white placeholder:text-white/60 
              placeholder:font-semibold w-[200px] lg:w-[250px] rounded-full
              h-9 focus:outline-none focus:ring-1 focus:ring-[#7c7c7c] text-sm ${searchFocused ? "pl-4" : "pl-10"}`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                setSearchFocused(false);
                setSearchResults([]);
              }, 200);
            }}
          />
          
          {/* Updated Search Results Dropdown */}
          {searchFocused && (
            <div className="absolute mt-2 w-full bg-[#202020] rounded-lg shadow-lg overflow-hidden z-50">
              {searchResults.length > 0 ? (
                searchResults.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 p-3 hover:bg-[#303030] cursor-pointer"
                    onClick={() => {
                      router.push(`/pages/game/${game.id}`);
                      setSearchTerm('');
                      setSearchResults([]);
                      setSearchFocused(false);
                    }}
                  >
                    <Image
                      src={game.banner || game.img || '/games/placeholder.jpg'}
                      alt={game.title}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-[12px] text-white font-semibold">{game.title}</span>
                      <div className="flex items-center gap-2">
                        {game.discount && (
                          <span className="text-xs text-green-500">{game.discount}</span>
                        )}
                        {game.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">{game.originalPrice}</span>
                        )}
                        <span className="text-xs text-gray-300">{game.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {searchTerm ? 'No games found' : 'Type to search games'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="hidden md:flex items-center ml-6 space-x-6 text-sm">
        <Link
          href="/"
          className={`text-[13px] ${poppins.className} ${pathname === '/'
            ? 'text-white light:text-black'
            : 'text-white/70 light:text-black/70'} 
          hover:text-gray-300`}
        >
          Discover
        </Link>
        <Link
          href="/pages/browse"
          className={`text-[13px] ${poppins.className} ${pathname === '/pages/browse'
            ? 'text-white light:text-black'
            : 'text-white/70 light:text-black/70'} 
          hover:text-gray-300`}
        >
          Browse
        </Link>
        <Link
          href="/pages/forums"
          className={`text-[13px] ${poppins.className} ${pathname === '/pages/forums'
            ? 'text-white light:text-black'
            : 'text-white/70 light:text-black/70'} 
          hover:text-gray-300`}
        >
          Forums
        </Link>
      </nav>

      <div className="flex items-center ml-auto space-x-9 text-sm">

        <div className="flex items-center">
        <Link href={'/pages/cart'} className="relative">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/70 mr-2 light:text-black">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
  {cartItemsCount > 0 && (
    <span className="absolute -top-2 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {cartItemsCount}
    </span>
  )}
</Link>

          {user.user !== null ? <div className="flex  z-[100] pr-2">
            <NotificationPopup />
          </div> : null}



          {user.user !== null ? (
            <div>

              <Image
                onClick={() => setIsProfileOpen(true)}
                src={user.user.avatar || "https://github.com/shadcn.png"}
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full m-2 w-8 h-8 cursor-pointer"
                priority
              />

              <ProfileModel
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          ) : (
            <nav className="flex justify-between items-center mx-auto">
              <button
                className="bg-zinc-700 text-white shadow-sm py-[0.45rem]  font-semibold text-[12px] rounded-md transition-colors ml-3 w-[70px]"
                onClick={() => setAuthOpen(true)}
              >
                <span className={`${poppins.className} `}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </span>
              </button>

              {isAuthOpen && (
                <AuthPopup
                  onClose={() => setAuthOpen(false)}
                  isSignUp={isSignUp}
                  toggleAuth={toggleAuth}
                />
              )}
            </nav>
          )}

        </div>
      </div>
    </header>

  );
}