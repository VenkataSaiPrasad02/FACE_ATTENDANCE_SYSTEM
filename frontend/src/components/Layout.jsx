import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-slate-50 antialiased selection:bg-indigo-500/15 selection:text-slate-900">

      {/* Ambient Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="
            absolute
            -left-[10%]
            -top-[20%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-gradient-to-br
            from-indigo-500/[0.03]
            to-blue-500/[0.02]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-[10%]
            top-[40%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-gradient-to-br
            from-blue-500/[0.025]
            to-cyan-500/[0.015]
            blur-3xl
          "
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Sidebar + Main */}
      <div className="flex min-h-[calc(100vh-4rem)] w-full">

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* 
            Extra page height ensures that the footer
            is below the initial viewport even when
            the page has very little content.
          */}
          <main
            className="
              min-w-0
              flex-1
              px-4
              py-6
              sm:px-6
              lg:px-8
              min-h-[calc(100vh-4rem)]
            "
          >
            <div className="mx-auto w-full max-w-[1440px]">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <Footer />

        </div>
      </div>

    </div>
  );
}