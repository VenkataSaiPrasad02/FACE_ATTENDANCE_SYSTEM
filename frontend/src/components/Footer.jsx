import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  ScanFace,
  Users,
  ClipboardCheck,
  HelpCircle,
  Mail,
  BookOpen,
  Activity,
  LockKeyhole,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.07] bg-[#060a1a]/80 backdrop-blur-xl">

      {/* Gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-70"
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/[0.08] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-6 lg:px-8">

        {/* =====================================================
            TOP INFORMATION AREA
        ===================================================== */}

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* ===================================================
              BRAND / ABOUT
          =================================================== */}

          <div className="max-w-md">

            {/* Logo */}
            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white shadow-glow">
                <GraduationCap size={22} strokeWidth={2.2} />
              </div>

              <div>
                <h2 className="font-display text-sm font-bold tracking-tight text-white">
                  Face Attendance System
                </h2>

                <p className="text-[11px] font-medium text-slate-500">
                  Smart Biometric Attendance
                </p>
              </div>

            </div>

            {/* Description */}
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              A smart biometric attendance platform designed to simplify
              student attendance, face registration, faculty management,
              and academic administration.
            </p>

            {/* Feature highlights */}
            <div className="mt-5 flex flex-wrap gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-cyan-300">
                <ScanFace size={13} />
                Face Recognition
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                <ClipboardCheck size={13} />
                Attendance
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-violet-300">
                <ShieldCheck size={13} />
                Secure Access
              </span>

            </div>

          </div>


          {/* ===================================================
              PRODUCT
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Product
            </h3>

            <ul className="space-y-3">

              <FooterItem icon={Activity} label="Dashboard" />

              <FooterItem icon={Users} label="Student Management" />

              <FooterItem icon={ScanFace} label="Face Registration" />

              <FooterItem icon={ClipboardCheck} label="Attendance" />

            </ul>

          </div>


          {/* ===================================================
              INFORMATION
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Information
            </h3>

            <ul className="space-y-3">

              <FooterItem icon={BookOpen} label="About System" />

              <FooterItem icon={ShieldCheck} label="Privacy & Security" />

              <FooterItem icon={LockKeyhole} label="Terms of Use" />

              <FooterItem icon={HelpCircle} label="Help & Support" />

            </ul>

          </div>


          {/* ===================================================
              SYSTEM
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              System
            </h3>

            <div className="space-y-3">

              {/* Status */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-3 py-2.5">

                <span className="status-dot-live shrink-0" aria-hidden="true" />

                <div>
                  <p className="text-xs font-semibold text-emerald-300">
                    System Operational
                  </p>

                  <p className="text-[10px] text-emerald-400/60">
                    All services available
                  </p>
                </div>

              </div>


              {/* Version */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">

                <div className="flex items-center justify-between">

                  <span className="text-[11px] font-medium text-slate-500">
                    Version
                  </span>

                  <span className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-300">
                    v1.0.0
                  </span>

                </div>

              </div>


              {/* Contact */}
              <div className="flex items-center gap-2 px-1 pt-1">

                <Mail size={14} className="text-slate-600" />

                <span className="text-xs text-slate-500">
                  System Support
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />


        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

          {/* Copyright */}
          <p className="text-[11px] font-medium text-slate-500">
            © 2026 Face Attendance System. All rights reserved.
          </p>


          {/* Developer */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">

            <span>
              Designed &amp; developed by
            </span>

            <span className="text-gradient-brand font-bold">
              TEAM LAZY
            </span>

          </div>


          {/* Version */}
          <div className="flex items-center gap-2">

            <span className="h-1 w-1 rounded-full bg-slate-600" />

            <span className="text-[10px] font-medium text-slate-500">
              Biometric Attendance Platform
            </span>

          </div>

        </div>

      </div>
    </footer>
  );
}


/* =========================================================
   REUSABLE FOOTER ITEM
========================================================= */

function FooterItem({ icon: Icon, label }) {
  return (
    <li>
      <div className="group flex cursor-default items-center gap-2.5 text-sm text-slate-400 transition-colors duration-200 hover:text-cyan-300">

        <Icon
          size={15}
          strokeWidth={1.8}
          className="shrink-0 text-slate-600 transition-colors duration-200 group-hover:text-cyan-400"
        />

        <span className="text-xs font-medium">
          {label}
        </span>

      </div>
    </li>
  );
}
