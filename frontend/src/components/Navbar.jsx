import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Clock,
  KeyRound,
  MoreVertical,
  X,
  User,
  Search,
  Wifi,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import NavbarCarousel from './NavbarCarousel';
import { hasPermission, PERMISSIONS } from '../auth/roles';
import ProfileAvatar from './ProfileAvatar';
import Button from './ui/Button';

const SEARCH_DESTINATIONS = [
  { label: 'Students', path: '/students', keywords: ['student', 'students', 'roll', 'class'], permission: PERMISSIONS.MANAGE_STUDENTS },
  { label: 'Faculty', path: '/teachers', keywords: ['faculty', 'teacher', 'teachers', 'staff'], permission: PERMISSIONS.MANAGE_TEACHERS },
  { label: 'Take Attendance', path: '/attendance', keywords: ['attendance', 'take attendance', 'mark'], permission: PERMISSIONS.MANAGE_ATTENDANCE },
  { label: 'Attendance History', path: '/history', keywords: ['history', 'attendance history', 'records'], permission: PERMISSIONS.VIEW_ATTENDANCE_HISTORY },
  { label: 'Face Registration', path: '/face-registration', keywords: ['face', 'registration', 'biometric', 'camera'], permission: PERMISSIONS.MANAGE_FACE_REGISTRATION },
  { label: 'Academic Periods', path: '/academic-periods', keywords: ['academic', 'period', 'semester', 'course'], permission: PERMISSIONS.MANAGE_ACADEMIC_PERIODS },
  { label: 'Calendar', path: '/calendar', keywords: ['calendar', 'holiday', 'holidays'], permission: PERMISSIONS.MANAGE_CALENDAR },
  { label: 'Admin Management', path: '/admin-management', keywords: ['admin', 'administration'], permission: PERMISSIONS.CREATE_ADMIN },
  { label: 'Dashboard', path: '/', keywords: ['dashboard', 'home', 'overview'], permission: PERMISSIONS.VIEW_DASHBOARD },
];

export default function Navbar() {
  const { username, role, logout, profilePhotoUrl } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBoxRef = useRef(null);

  const searchableDestinations = useMemo(
    () =>
      SEARCH_DESTINATIONS.filter(
        (d) => !d.permission || hasPermission(role, d.permission)
      ),
    [role]
  );

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return searchableDestinations;
    return searchableDestinations.filter(
      (d) =>
        d.label.toLowerCase().includes(term) ||
        d.keywords.some((k) => k.includes(term))
    );
  }, [searchTerm, searchableDestinations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToDestination = (destination) => {
    setSearchOpen(false);
    setSearchTerm('');
    navigate(destination.path);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      goToDestination(searchResults[0]);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  useEffect(() => {
    if (!logoutConfirmOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLogoutConfirmOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [logoutConfirmOpen]);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className="navbar-gradient-bg sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 px-4 shadow-md sm:px-6 lg:pr-8">

        {/* Animated gradient + blob layer (behind content) */}
        <div className="navbar-gradient-overlay" aria-hidden="true">
          <span className="navbar-gradient-blob navbar-gradient-blob--1" />
          <span className="navbar-gradient-blob navbar-gradient-blob--2" />
          <span className="navbar-gradient-blob navbar-gradient-blob--3" />
        </div>

        {/* Left side — fixed width, never shrinks */}
        <div className="relative z-10 flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-xs backdrop-blur-sm sm:flex">
            <Clock size={14} className="shrink-0 text-cyan-300" />

            <span className="font-normal text-slate-300">
              {formatDate(currentTime)}
            </span>

            <span className="text-slate-400">•</span>

            <span className="font-semibold tracking-tight text-white tabular-nums">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Center — fills all remaining empty space with the carousel */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center justify-center">
          <NavbarCarousel />
        </div>

        {/* Right side — fixed width, never shrinks */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Profile */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            title="View my profile"
            className="group flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-left shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-cyan-300/30 hover:bg-white/15 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <ProfileAvatar
              photoUrl={profilePhotoUrl}
              name={username}
              size="sm"
            />

            <div className="hidden flex-col sm:flex">
              <span className="text-xs font-bold leading-tight tracking-tight text-white">
                {username || 'User'}
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                {role || 'Staff'}
              </span>
            </div>
          </button>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 sm:flex">

            <Button
              variant="secondary"
              size="sm"
              icon={KeyRound}
              onClick={() => navigate('/change-password')}
              title="Change password"
              className="border-white/15 bg-white/10 px-3.5 text-slate-100 hover:bg-white/15"
            >
              Password
            </Button>

            <button
              type="button"
              onClick={openLogoutConfirmation}
              className="group flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-slate-100 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-rose-300/40 hover:bg-rose-500/15 hover:text-rose-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              title="Sign out of your account"
            >
              <LogOut
                size={14}
                className="text-slate-300 transition-colors group-hover:text-rose-300"
              />

              <span>Logout</span>
            </button>

          </div>

          {/* Mobile Menu */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-slate-100 transition-colors hover:bg-white/15"
            >
              <MoreVertical size={18} />
            </button>

            {mobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg backdrop-blur animate-scale-in">

                  <div className="mb-1 border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-bold text-slate-900">
                      {username}
                    </p>

                    <p className="text-[10px] font-semibold uppercase text-indigo-600">
                      {role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User size={15} className="text-slate-400" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/change-password');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <KeyRound size={15} className="text-slate-400" />
                    Change Password
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={openLogoutConfirmation}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={15} className="text-rose-500" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================
          LOGOUT CONFIRMATION
      ========================================================= */}
      {logoutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >

          {/* Backdrop */}
          <div
            onClick={cancelLogout}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-fade-in"
          />

          {/* Modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl animate-scale-in"
          >

            {/* =====================================================
                GRADIENT HERO
            ====================================================== */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-indigo-600 px-8 pb-10 pt-10 text-center">

              {/* Decorative gradient glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-indigo-300/20 blur-2xl" />

              {/* Close button */}
              <button
                type="button"
                onClick={cancelLogout}
                aria-label="Close logout confirmation"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <X size={18} />
              </button>

              {/* Logout Icon */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
                <LogOut
                  size={32}
                  strokeWidth={2.1}
                  className="text-white"
                />
              </div>

              {/* Small label */}
              <p className="relative mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                Account Session
              </p>
            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}
            <div className="px-8 pb-9 pt-8 text-center sm:px-10">

              <h3
                id="logout-title"
                className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
              >
                Sign out of your account?
              </h3>

              <p
                id="logout-description"
                className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]"
              >
                You’re about to end your current session. You can sign in
                again anytime to continue using the attendance system.
              </p>

              {/* ===================================================
                  ACTIONS
              ==================================================== */}
              <div className="mt-8 grid grid-cols-2 gap-3">

                {/* Cancel */}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={cancelLogout}
                  className="h-11 w-full justify-center rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition-all duration-200 hover:from-rose-600 hover:to-red-700 hover:shadow-lg hover:shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}