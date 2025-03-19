"use client";
import { Poppins } from 'next/font/google';
import { useState, useEffect } from 'react';
import AuthPopup from '../Auth/AuthPopup';
import ProfileModel from '@/app/components/models/ProfileModel';
import { useUser } from "../../contexts/UserContext";
import Link from 'next/link';

const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});

export default function Navbar() {
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const user = useUser();
  
  // Initialize theme on component mount
  useEffect(() => {
    // Check if theme preference was saved
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsLight(savedTheme === 'light');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    
    document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', newIsLight ? 'light' : 'dark');
  };
  
  const toggleAuth = () => {
    setIsSignUp(!isSignUp);

  };

  return (  

    <header className="flex items-center px-4 py-3 bg-[#111111] light:bg-light border-b border-white/10 light:border-gray-200 ">
      <div className="flex items-center">
        <Link href="/" className="mr-64">
          <div className="w-10 h-10 rounded flex items-center justify-center">
            {/* <Image src='/logo.png' width={100} height={100} alt={''}></Image> */}
            <p className={`${poppins.className} ml-28 text-lg text-white light:text-black`}>PlayVerse </p><span
              className='text-[10px] mt-[0.20rem] ml-1 font-bold text-green-400'>v1.0</span>
          </div>
        </Link>
        <button className="p-2 mr-2 rounded-full hover:bg-[#303030] lg:flex hidden">
         
        </button>
        <div className="relative ">
          <div
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-opacity ${searchFocused ? "opacity-0" : "opacity-100"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search store"
            className={`pl-10 bg-[#303030] light:bg-gray-100 light:text-black light:border border-zinc-400 light:placeholder:text-black/50 text-white placeholder:text-white/60 
              placeholder:font-semibold  w-[200px] lg:w-[250px] rounded-full
               h-9 focus:outline-none focus:ring-1 focus:ring-[#7c7c7c] text-sm ${searchFocused ? "pl-4" : "pl-10"} `}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <nav className="hidden md:flex items-center ml-6 space-x-6 text-sm">
        <Link href="/" className="font-medium text-white light:text-black hover:text-gray-300">
          Discover
        </Link>
        <Link href="/pages/browse" className="font-medium text-white/70 light:text-black/70 hover:text-gray-300">
          Browse
        </Link>
        <Link href="/pages/forums" className="font-medium text-white/70 light:text-black/70 hover:text-gray-300">
          Forums
        </Link>
      </nav>
      <button 
        onClick={toggleTheme} 
        className="p-2 mr-2 rounded-full hover:bg-[#404040] light:hover:bg-gray-200 ml-6"
        aria-label="Toggle theme"
      >
        {isLight ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-black">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        )}
      </button>

      <div className="flex items-center ml-auto space-x-9 text-sm">
        <a href="#" className="font-medium text-white/70 light:text-black/70 hover:text-gray-300 hidden sm:block">
          Wishlist
        </a>
        <a href="#" className="flex items-center font-medium hover:text-gray-300 light:text-black/70">

          <span>Cart</span>
          <div className="ml-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </div>
        </a>
        <div className="flex items-center">
          <div className="relative mr-2">
            <button className="p-1 rounded-full bg-[#303030] light:bg-zinc-500 light:hover:bg-zinc-300 hover:bg-[#404040] w-10 h-10 flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              2
            </div>
          </div>
          {user.user !== null ? (
            <>
              <button 
                className="p-1 rounded-full bg-[#303030] hover:bg-[#404040] light:bg-zinc-500 light:hover:bg-zinc-300 w-10 h-10 flex items-center justify-center"
                onClick={() => setIsProfileOpen(true)}
              >
                <span className="font-bold">
                  {user.user.username[0].toUpperCase()}
                </span>
              </button>
              <ProfileModel 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </>
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