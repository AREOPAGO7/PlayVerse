import { useAuth } from '../../hooks/useAuth';
import { FC } from 'react';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

const ProfilePopup: FC<ProfilePopupProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
}) => {
  const { logout } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-64 rounded-lg bg-[#303030] shadow-lg z-111111">
      <div className="p-4">
        <div className="mb-4 border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold text-white">{userName || 'User'}</h3>
          <p className="text-sm text-gray-300">{userEmail}</p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
