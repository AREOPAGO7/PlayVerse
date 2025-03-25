"use client"
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SunMoon } from 'lucide-react';

interface ProfileModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModel: React.FC<ProfileModelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

  const [isLight, setIsLight] = useState(false);

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


  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 " style={{ zIndex: 100 }} onClick={onClose}>
      <div
        className="absolute right-4 top-16 w-96 bg-zinc-900 rounded-xl shadow-lg p-4 light:bg-white border border-white/10 light:border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-2 border-b border-white/10 light:border-black/20">
          <Image
            src={user.avatar || "https://github.com/shadcn.png"}
            alt="Profile"
            width={56}
            height={56}
            className="rounded-full m-2 w-14 h-14"
          />
          <div>
            <h2 className="font-bold text-white light:text-black/70">{user.username}</h2>
            <p className="text-sm text-zinc-400 light:text-black/70">{user.fidelityPoints}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-3 ml-3">
          <button
            onClick={() => router.push(`/profile/${user.uid}`)}
            className="w-full text-left px-4 py-2 text-sm font-semibold text-white/60 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2 light:text-black/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            View Profile
          </button>

          <div className="flex items-center w-full px-4 py-2 mt-1 ">
          <SunMoon className='text-white/60 w-[20px] light:text-black/80'/>
            <span className="text-sm font-semibold text-white/60 ml-2 light:text-black/80">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`ml-auto relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none  ${
                isLight ? 'bg-zinc-400' : 'bg-green-600'
              }`}
              role="switch"
              aria-checked={!isLight}
            >
              <span
                className={`${
                  isLight ? 'translate-x-1' : 'translate-x-6'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full ml-1 text-left px-4 py-2 text-sm  font-semibold mt-2 text-white/60 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2 light:text-black/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModel;

function setIsSignUp(arg0: boolean) {
  throw new Error('Function not implemented.');
}
