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
    <footer className="relative mt-auto overflow-hidden border-t border-slate-200/70 bg-white/75 backdrop-blur-xl">

      {/* Subtle gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 opacity-60"
      />

      {/* Very subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-indigo-400/[0.05] blur-3xl"
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

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap
                  size={22}
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                  Face Attendance System
                </h2>

                <p className="text-[11px] font-medium text-slate-400">
                  Smart Biometric Attendance
                </p>
              </div>

            </div>

            {/* Description */}
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              A smart biometric attendance platform designed to simplify
              student attendance, face registration, faculty management,
              and academic administration.
            </p>

            {/* Feature highlights */}
            <div className="mt-5 flex flex-wrap gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
                <ScanFace size={13} />
                Face Recognition
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
                <ClipboardCheck size={13} />
                Attendance
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50/70 px-3 py-1.5 text-[11px] font-semibold text-violet-600">
                <ShieldCheck size={13} />
                Secure Access
              </span>

            </div>

          </div>


          {/* ===================================================
              PRODUCT
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Product
            </h3>

            <ul className="space-y-3">

              <FooterItem
                icon={Activity}
                label="Dashboard"
              />

              <FooterItem
                icon={Users}
                label="Student Management"
              />

              <FooterItem
                icon={ScanFace}
                label="Face Registration"
              />

              <FooterItem
                icon={ClipboardCheck}
                label="Attendance"
              />

            </ul>

          </div>


          {/* ===================================================
              INFORMATION
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Information
            </h3>

            <ul className="space-y-3">

              <FooterItem
                icon={BookOpen}
                label="About System"
              />

              <FooterItem
                icon={ShieldCheck}
                label="Privacy & Security"
              />

              <FooterItem
                icon={LockKeyhole}
                label="Terms of Use"
              />

              <FooterItem
                icon={HelpCircle}
                label="Help & Support"
              />

            </ul>

          </div>


          {/* ===================================================
              SYSTEM
          =================================================== */}

          <div>

            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              System
            </h3>

            <div className="space-y-3">

              {/* Status */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">

                <span className="relative flex h-2.5 w-2.5">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

                </span>

                <div>
                  <p className="text-xs font-semibold text-emerald-700">
                    System Operational
                  </p>

                  <p className="text-[10px] text-emerald-600/70">
                    All services available
                  </p>
                </div>

              </div>


              {/* Version */}
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2.5">

                <div className="flex items-center justify-between">

                  <span className="text-[11px] font-medium text-slate-500">
                    Version
                  </span>

                  <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-indigo-600 shadow-sm">
                    v1.0.0
                  </span>

                </div>

              </div>


              {/* Contact */}
              <div className="flex items-center gap-2 px-1 pt-1">

                <Mail
                  size={14}
                  className="text-slate-400"
                />

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

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />


        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

          {/* Copyright */}
          <p className="text-[11px] font-medium text-slate-400">
            © 2026 Face Attendance System. All rights reserved.
          </p>


          {/* Developer */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">

            <span>
              Designed & developed by
            </span>

            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              TEAM LAZY
            </span>

          </div>


          {/* Version */}
          <div className="flex items-center gap-2">

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span className="text-[10px] font-medium text-slate-400">
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
      <div className="group flex cursor-default items-center gap-2.5 text-sm text-slate-500 transition-colors duration-200 hover:text-indigo-600">

        <Icon
          size={15}
          strokeWidth={1.8}
          className="shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-indigo-500"
        />

        <span className="text-xs font-medium">
          {label}
        </span>

      </div>
    </li>
  );
}