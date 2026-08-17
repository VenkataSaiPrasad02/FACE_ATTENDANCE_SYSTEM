import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Clock, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileAvatar from './ProfileAvatar'; // NEW

export default function Navbar() {
  const { username, role, profilePhotoUrl, logout } = useAuth(); // profilePhotoUrl added
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden items-center gap-2 text-gray-600 sm:flex"
        >
          <Clock size={18} className="text-blue-600" />
          <span className="font-medium tabular-nums">{formatTime(currentTime)}</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 sm:gap-4"
      >
        <button
          type="button"
          onClick={() => navigate('/profile')}
          title="View my profile"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 sm:px-4 sm:py-2"
        >
          <ProfileAvatar photoUrl={profilePhotoUrl} name={username} size="sm" shape="lg" />
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{username}</span>
            <span className="text-xs font-medium text-blue-600 leading-tight">{role}</span>
          </div>
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/change-password')}
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-sm font-medium text-blue-600 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700 sm:px-4"
          title="Change password"
        >
          <KeyRound size={16} />
          <span className="hidden sm:inline">Change Password</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow sm:px-4"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </motion.div>
    </header>
  );
}