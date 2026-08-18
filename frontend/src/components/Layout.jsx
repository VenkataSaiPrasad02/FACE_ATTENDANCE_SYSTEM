import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#fafafa]">
      {/* Ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 500px at 10% -10%, rgba(16,163,127,0.06), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(99,102,241,0.05), transparent 60%)',
        }}
      />

      <Navbar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
