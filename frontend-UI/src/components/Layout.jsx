import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050816] antialiased selection:bg-cyan-400/25 selection:text-white">

      {/* Ambient animated background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Base mesh */}
        <div className="absolute inset-0 bg-mesh-subtle" />

        {/* Subtle tech grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(103, 232, 249, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(103, 232, 249, 0.035) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage:
              'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)',
          }}
        />

        {/* Aurora blobs — decorative only; hidden on phones to keep the
            viewport calm and rendering cheap where space is scarce */}
        <div className="gradient-dashboard absolute -left-[12%] -top-[22%] h-[620px] w-[620px] rounded-full bg-gradient-to-br from-blue-600/[0.13] to-cyan-500/[0.07] blur-3xl max-md:hidden" />
        <div className="gradient-history absolute -right-[10%] top-[38%] h-[540px] w-[540px] rounded-full bg-gradient-to-br from-indigo-600/[0.11] to-violet-500/[0.06] blur-3xl max-md:hidden" />
        <div className="gradient-face absolute bottom-[-18%] left-[28%] h-[460px] w-[460px] rounded-full bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.05] blur-3xl max-lg:hidden" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Sidebar + Main */}
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-1">

        {/* Sidebar (desktop rail / mobile drawer) */}
        <Sidebar />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main
            className="
              min-w-0 flex-1 px-3 py-4
              sm:px-6 sm:py-6 lg:px-8
              min-h-[calc(100vh-4rem)]
              animate-fade-in
              pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-8
            "
          >
            <div className="mx-auto w-full max-w-[1440px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation (hidden on desktop) */}
      <MobileNav />

    </div>
  );
}
