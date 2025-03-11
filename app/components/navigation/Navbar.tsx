"use client";
import { Poppins } from 'next/font/google';
import { useState } from 'react';
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
  const [searchFocused, setSearchFocused] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useUser()
  const toggleAuth = () => {
    setIsSignUp(!isSignUp);

  };

  return (  

    <header className="flex items-center px-4 py-4 bg-[#111111] border-b border-white/10">
      <div className="flex items-center">
        <a href="/" className="mr-64">
          <div className="w-10 h-10 rounded flex items-center justify-center">
            {/* <Image src='/logo.png' width={100} height={100} alt={''}></Image> */}
            <p className={` ${poppins.className} ml-28 text-lg`}>PlayVerse </p><span
              className='text-[10px] mt-[0.20rem] ml-1 font-bold text-green-400'>v1.0</span>
          </div>
        </a>
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
            className={`pl-10 bg-[#303030] text-white placeholder:text-white/60 placeholder:font-semibold border-none w-[200px] lg:w-[250px] rounded-full h-9 focus:outline-none focus:ring-1 focus:ring-[#7c7c7c] text-sm ${searchFocused ? "pl-4" : "pl-10"} `}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <nav className="hidden md:flex items-center ml-6 space-x-6">
        <Link href="/" className="font-medium hover:text-gray-300">
          Discover
        </Link>
        <Link href="/pages/browse" className="font-medium text-white/70 hover:text-gray-300">
          Browse
        </Link>
        <Link href="/pages/forums" className="font-medium text-white/70 hover:text-gray-300">
        Forums
        </Link>
      </nav>

      <div className="flex items-center ml-auto space-x-9">
        <a href="#" className="font-medium text-white/70 hover:text-gray-300 hidden sm:block">
          Wishlist
        </a>
        <a href="#" className="flex items-center font-medium hover:text-gray-300">

          <span>Cart</span>
          <div className="ml-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </div>
        </a>
        <div className="flex items-center">
          <div className="relative mr-2">
            <button className="p-1 rounded-full bg-[#303030] hover:bg-[#404040] w-10 h-10 flex items-center justify-center">
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
                className="p-1 rounded-full bg-[#303030] hover:bg-[#404040] w-10 h-10 flex items-center justify-center"
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
                className="bg-zinc-700 text-white shadow-sm py-[0.45rem] font-semibold text-[12px] rounded-md transition-colors ml-3 w-[70px]"
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