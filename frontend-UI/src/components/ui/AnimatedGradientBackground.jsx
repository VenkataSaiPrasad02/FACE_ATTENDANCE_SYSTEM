import React from 'react';

const themes = {
  dashboard: {
    base: 'from-[#0a1128] via-[#050816] to-[#0b0f26]',
    blob1: 'bg-blue-600/25',
    blob2: 'bg-violet-600/20',
    blob3: 'bg-cyan-500/15',
    animation: 'gradient-dashboard',
  },

  students: {
    base: 'from-[#071426] via-[#050816] to-[#081c2c]',
    blob1: 'bg-cyan-500/25',
    blob2: 'bg-sky-600/20',
    blob3: 'bg-teal-500/15',
    animation: 'gradient-students',
  },

  faculty: {
    base: 'from-[#120b26] via-[#050816] to-[#160d2e]',
    blob1: 'bg-violet-600/25',
    blob2: 'bg-fuchsia-600/18',
    blob3: 'bg-purple-500/15',
    animation: 'gradient-faculty',
  },

  face: {
    base: 'from-[#061226] via-[#050816] to-[#0a1030]',
    blob1: 'bg-cyan-500/30',
    blob2: 'bg-blue-600/25',
    blob3: 'bg-indigo-500/20',
    animation: 'gradient-face',
  },

  attendance: {
    base: 'from-[#06171a] via-[#050816] to-[#07211f]',
    blob1: 'bg-emerald-500/22',
    blob2: 'bg-teal-500/20',
    blob3: 'bg-lime-400/12',
    animation: 'gradient-attendance',
  },

  history: {
    base: 'from-[#080e24] via-[#050816] to-[#0c1228]',
    blob1: 'bg-blue-600/18',
    blob2: 'bg-indigo-600/16',
    blob3: 'bg-slate-500/10',
    animation: 'gradient-history',
  },

  academic: {
    base: 'from-[#150b28] via-[#050816] to-[#1a0e33]',
    blob1: 'bg-purple-600/22',
    blob2: 'bg-violet-600/20',
    blob3: 'bg-fuchsia-500/14',
    animation: 'gradient-academic',
  },

  calendar: {
    base: 'from-[#171106] via-[#050816] to-[#211708]',
    blob1: 'bg-amber-500/18',
    blob2: 'bg-orange-500/16',
    blob3: 'bg-yellow-400/10',
    animation: 'gradient-calendar',
  },

  admin: {
    base: 'from-[#190a14] via-[#050816] to-[#220c18]',
    blob1: 'bg-rose-500/20',
    blob2: 'bg-pink-500/16',
    blob3: 'bg-red-400/12',
    animation: 'gradient-admin',
  },
};

export default function AnimatedGradientBackground({
  children,
  type = 'dashboard',
  className = '',
}) {
  const theme = themes[type] || themes.dashboard;

  return (
    <div
      className={`
        relative
        isolate
        min-h-full
        w-full
        overflow-hidden
        bg-gradient-to-br
        ${theme.base}
        ${className}
      `}
    >
      {/* ==============================================
          ANIMATION LAYER
      =============================================== */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

        {/* Blob 1 */}
        <div
          className={`
            absolute -left-32 -top-32
            h-[420px] w-[420px]
            rounded-full blur-3xl
            ${theme.blob1}
            ${theme.animation}
          `}
        />

        {/* Blob 2 */}
        <div
          className={`
            absolute -bottom-40 -right-40
            h-[500px] w-[500px]
            rounded-full blur-3xl
            ${theme.blob2}
            ${theme.animation}
          `}
          style={{ animationDelay: '-4s' }}
        />

        {/* Blob 3 */}
        <div
          className={`
            absolute left-1/2 top-1/3 h-[300px] w-[300px]
            -translate-x-1/2 rounded-full blur-3xl
            ${theme.blob3}
            ${theme.animation}
          `}
          style={{ animationDelay: '-8s' }}
        />

        {/* Moving light streak */}
        <div
          className="
            absolute -left-1/3 top-0 h-full w-1/3 rotate-12
            bg-gradient-to-r from-transparent via-cyan-200/[0.06] to-transparent
            blur-2xl animate-light-pass
          "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-full">
        {children}
      </div>
    </div>
  );
}
