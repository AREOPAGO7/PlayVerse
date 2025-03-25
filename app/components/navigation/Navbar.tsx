"use client";
import { Poppins } from 'next/font/google';
import { useState} from 'react';
import AuthPopup from '../Auth/AuthPopup';
import ProfileModel from '@/app/components/models/ProfileModel';
import { useUser } from "../../contexts/UserContext";
import Link from 'next/link';
import Image from 'next/image';
import NotificationPopup from './NotificationPopup';
import { usePathname } from "next/navigation";


const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});

export default function Navbar() {
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = useUser();

  // Initialize theme on component mount

  const pathname = usePathname();

  const toggleAuth = () => {
    setIsSignUp(!isSignUp);

  };

  return (

    <header className="flex items-center px-4 py-3 bg-[#111111] light:bg-light border-b border-white/10 light:border-gray-200 ">
      <div className="flex items-center">
        <Link href="/" className="mr-64">
          <div className="w-10 h-10 rounded flex items-center justify-center">
             <Image src='/logo.png' width={80} height={80} alt={''} className='ml-4'></Image> 
            {/* <p className={`${poppins.className} ml-28 text-lg text-white light:text-black`}>PlayVerse </p> */}
            {/* <span
              className='text-[10px] mt-[0.20rem] ml-1 font-bold text-green-400'>v1.0</span> */}
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

             {user.user !== null ?  <div className="flex  z-[100] pr-2">
            <NotificationPopup />
          </div> : null }
          


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