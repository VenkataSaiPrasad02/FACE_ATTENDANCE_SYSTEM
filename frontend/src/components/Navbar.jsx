import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut,
  Clock,
  KeyRound,
  MoreVertical,
  X,
} from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

export default function Navbar() {
  const { username, role, logout, profilePhotoUrl } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date()),
      1000
    );

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openLogoutConfirmation = () => {
    setMobileMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header
        className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/[0.06] px-3 sm:px-6"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'saturate(180%) blur(14px)',
          WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        }}
      >
        {/* Left side */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3 py-1.5 text-[13px] font-medium text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:flex"
          >
            <Clock
              size={15}
              className="text-neutral-500"
            />

            <span className="tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </span>
          </motion.div>
        </div>

        {/* Right side */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Profile */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            title="View my profile"
            className="flex items-center gap-3 rounded-full border border-black/[0.06] bg-white/70 py-1 pl-1 pr-1 text-left transition-all hover:border-black/[0.12] hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:pr-3"
          >
            <ProfileAvatar
              photoUrl={profilePhotoUrl}
              name={username}
              size="sm"
              shape="lg"
            />

            <div className="hidden flex-col pr-1 sm:flex">
              <span className="text-[13px] font-semibold leading-tight text-neutral-900">
                {username}
              </span>

              <span className="text-[11px] font-medium leading-tight text-neutral-500">
                {role}
              </span>
            </div>
          </button>

          {/* ================= DESKTOP ACTIONS ================= */}
          <div className="hidden items-center gap-2 sm:flex">
            {/* Change Password */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/change-password')}
              className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-[13px] font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900"
              title="Change password"
            >
              <KeyRound size={15} />
              <span>Change Password</span>
            </motion.button>

            {/* Logout */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openLogoutConfirmation}
              className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-2 text-[13px] font-medium text-neutral-700 transition-all hover:border-red-200 hover:bg-red-50/70 hover:text-red-600 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* ================= MOBILE MENU ================= */}
          <div className="relative sm:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label="Open account menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <MoreVertical size={19} />
            </motion.button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-12 z-[70] w-48 overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 p-1.5 shadow-lg backdrop-blur">
                {/* Mobile Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/change-password');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>

                {/* Mobile Logout */}
                <button
                  type="button"
                  onClick={openLogoutConfirmation}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      {/* ================= LOGOUT CONFIRMATION ================= */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/15 p-5 backdrop-blur-md">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:p-10"
          >
            {/* Icon + Close */}
            <div className="flex items-start justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100/80 bg-red-50/70">
                <LogOut
                  size={27}
                  className="text-red-500"
                />
              </div>

              <button
                type="button"
                onClick={cancelLogout}
                aria-label="Close logout confirmation"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white/60 text-neutral-500 transition-all hover:bg-white hover:text-neutral-800"
              >
                <X size={19} />
              </button>
            </div>

            {/* Content */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Confirm logout
              </h3>

              <p className="mt-4 text-base leading-7 text-neutral-500">
                Are you sure you want to log out of your account?
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                You will need to sign in again to access your dashboard.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex items-center justify-end gap-4 border-t border-black/6 pt-6">
              {/* Cancel */}
              <button
                type="button"
                onClick={cancelLogout}
                className="rounded-xl border border-black/8 bg-white/70 px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-black/[0.1] hover:bg-white hover:shadow-sm"
              >
                Cancel
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-xl border border-red-500/10 bg-red-500/90 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}