import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ScanFace,
  ShieldCheck,
  Clock3,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import LoginForm from './LoginForm';

const features = [
  {
    icon: ScanFace,
    title: 'Face-powered attendance',
    description: 'Fast and reliable biometric attendance in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure access',
    description: 'Role-based access keeps student and admin data protected.',
  },
  {
    icon: Clock3,
    title: 'Real-time records',
    description: 'Attendance status and history stay synchronized.',
  },
];

export default function LoginPage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px]">

        {/* LEFT SIDE */}
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden px-12 py-12 lg:flex xl:px-20">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <GraduationCap size={24} className="text-white" />
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide text-white">
                FACE ATTENDANCE
              </p>
              <p className="text-xs text-slate-400">
                Intelligent attendance management
              </p>
            </div>
          </motion.div>

          {/* Main message */}
          <div className="relative max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles size={14} />
                Smarter attendance starts here
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
                Attendance,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                  simplified.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 xl:text-lg">
                Manage students, capture attendance with facial recognition,
                track records, and keep your academic operations organized
                from one place.
              </p>
            </motion.div>

            {/* Feature cards */}
            <div className="mt-10 space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.3 + index * 0.12,
                      duration: 0.5,
                    }}
                    className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 transition-transform duration-300 group-hover:scale-105">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-slate-600">
            Secure biometric attendance system • v1.0.0
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex w-full items-center justify-center px-5 py-8 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-md"
          >

            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <GraduationCap size={24} className="text-white" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-white">
                  FACE ATTENDANCE
                </p>
                <p className="text-xs text-slate-400">
                  Attendance management
                </p>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.97] p-7 shadow-2xl shadow-black/30 sm:p-9">

              {/* Card header */}
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <ScanFace size={24} className="text-blue-600" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your attendance dashboard.
                </p>
              </div>

              <LoginForm />

              <div className="mt-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Secure sign in
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                Your credentials are transmitted securely and used only
                for authentication.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              © 2026 Face Attendance System
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

