import React from 'react';

const themes = {
  dashboard: {
    base: 'from-blue-50 via-white to-violet-50',
    blob1: 'bg-blue-400/20',
    blob2: 'bg-violet-400/20',
    blob3: 'bg-cyan-300/15',
    animation: 'gradient-dashboard',
  },

  students: {
    base: 'from-cyan-50 via-white to-sky-50',
    blob1: 'bg-cyan-400/20',
    blob2: 'bg-sky-400/20',
    blob3: 'bg-teal-300/15',
    animation: 'gradient-students',
  },

  faculty: {
    base: 'from-violet-50 via-white to-fuchsia-50',
    blob1: 'bg-violet-400/20',
    blob2: 'bg-fuchsia-400/20',
    blob3: 'bg-purple-300/15',
    animation: 'gradient-faculty',
  },

  face: {
    base: 'from-cyan-50 via-blue-50 to-indigo-100',
    blob1: 'bg-cyan-400/25',
    blob2: 'bg-blue-500/20',
    blob3: 'bg-indigo-400/20',
    animation: 'gradient-face',
  },

  attendance: {
    base: 'from-emerald-50 via-white to-teal-50',
    blob1: 'bg-emerald-400/20',
    blob2: 'bg-teal-400/20',
    blob3: 'bg-lime-300/15',
    animation: 'gradient-attendance',
  },

  history: {
    base: 'from-slate-50 via-blue-50 to-indigo-50',
    blob1: 'bg-blue-400/15',
    blob2: 'bg-indigo-400/15',
    blob3: 'bg-slate-400/10',
    animation: 'gradient-history',
  },

  academic: {
    base: 'from-purple-50 via-white to-violet-50',
    blob1: 'bg-purple-400/20',
    blob2: 'bg-violet-400/20',
    blob3: 'bg-fuchsia-300/15',
    animation: 'gradient-academic',
  },

  calendar: {
    base: 'from-amber-50 via-white to-orange-50',
    blob1: 'bg-amber-400/20',
    blob2: 'bg-orange-400/20',
    blob3: 'bg-yellow-300/15',
    animation: 'gradient-calendar',
  },

  admin: {
    base: 'from-rose-50 via-white to-pink-50',
    blob1: 'bg-rose-400/20',
    blob2: 'bg-pink-400/20',
    blob3: 'bg-red-300/15',
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
            absolute
            -left-32
            -top-32
            h-[420px]
            w-[420px]
            rounded-full
            blur-3xl
            ${theme.blob1}
            ${theme.animation}
          `}
        />

        {/* Blob 2 */}
        <div
          className={`
            absolute
            -bottom-40
            -right-40
            h-[500px]
            w-[500px]
            rounded-full
            blur-3xl
            ${theme.blob2}
            ${theme.animation}
          `}
          style={{
            animationDelay: '-4s',
          }}
        />

        {/* Blob 3 */}
        <div
          className={`
            absolute
            left-1/2
            top-1/3
            h-[300px]
            w-[300px]
            -translate-x-1/2
            rounded-full
            blur-3xl
            ${theme.blob3}
            ${theme.animation}
          `}
          style={{
            animationDelay: '-8s',
          }}
        />

        {/* Moving light streak */}
        <div
          className="
            absolute
            -left-1/3
            top-0
            h-full
            w-1/3
            rotate-12
            bg-gradient-to-r
            from-transparent
            via-white/25
            to-transparent
            blur-2xl
            animate-light-pass
          "
        />

      </div>

      {/* Very subtle readability layer */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-white/20" />

      {/* Content */}
      <div className="relative z-10 min-h-full">
        {children}
      </div>
    </div>
  );
}