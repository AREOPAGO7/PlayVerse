"use client"
import React from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModel: React.FC<ProfileModelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

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
    <div className="fixed inset-0 " style={{zIndex:100}} onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 bg-zinc-900 rounded-xl shadow-lg p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-2 border-b border-white/10">
          <Image
            src={user.avatar || "https://github.com/shadcn.png"}
            alt="Profile"
            width={56}
            height={56}
            className="rounded-full m-2 w-14 h-14"
          />
          <div>
            <h2 className="font-bold text-white">{user.username}</h2>
            <p className="text-sm text-zinc-400">{user.level}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-3 ml-3">
          <button 
            onClick={() => router.push(`/profile/${user.uid}`)}
            className="w-full text-left px-4 py-2 text-sm font-semibold text-white/60 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            View Profile
          </button>

          <button 
            onClick={() => router.push('/settings')}
            className="w-full text-left px-4 py-2 text-sm font-semibold mt-2 text-white/60 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Settings
          </button>

          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm  font-semibold mt-2 text-white/60 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModel;