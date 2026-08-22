import React from 'react';
import { Navigate } from 'react-router-dom';
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
    title: 'Face-Powered Attendance',
    description:
      'Fast, touchless, and reliable biometric attendance matching in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Access & Multi-Factor Auth',
    description:
      'Role-based access control and email OTP protection keep institutional data safe.',
  },
  {
    icon: Clock3,
    title: 'Real-Time Records & Sync',
    description:
      'Attendance history and daily logs synchronized seamlessly across sessions.',
  },
];

export default function LoginPage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page-bg relative min-h-screen overflow-hidden antialiased selection:bg-indigo-500/15 selection:text-slate-900">

      {/* =====================================================
          AMBIENT BACKGROUND LIGHTING
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-[15%] -left-[10%] h-[650px] w-[650px] rounded-full bg-indigo-500/[0.04] blur-3xl" />

        <div className="absolute -bottom-[15%] -right-[10%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.035] blur-3xl" />

        <div className="absolute left-[35%] top-[35%] h-[400px] w-[400px] rounded-full bg-cyan-400/[0.025] blur-3xl" />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">

        {/* ===================================================
            LEFT BRANDING / HERO
        =================================================== */}

        <section className="login-hero-panel relative hidden w-1/2 flex-col justify-between p-12 lg:flex xl:p-16">

          {/* -------------------------------------------------
              BRAND
          ------------------------------------------------- */}

          <div className="relative z-10 flex items-center gap-3">

            <div className="login-brand-logo flex h-11 w-11 items-center justify-center rounded-2xl text-white">
              <GraduationCap
                size={24}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                Face Attendance System
              </p>

              <p className="text-xs text-slate-500">
                Institutional Biometric Platform
              </p>
            </div>

          </div>


          {/* -------------------------------------------------
              HERO CONTENT
          ------------------------------------------------- */}

          <div className="relative z-10 my-auto max-w-lg space-y-8">

            <div className="space-y-4">

              {/* Badge */}

              <div className="login-hero-badge inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-indigo-700">

                <Sparkles
                  size={14}
                  className="relative z-10 text-indigo-600"
                />

                <span className="relative z-10">
                  Modern AI-Powered Attendance Management
                </span>

              </div>


              {/* Heading */}

              <h1 className="login-hero-heading text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                Accurate, frictionless attendance for modern institutions.
              </h1>


              {/* Description */}

              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                Streamline classroom attendance, manage faculty and student
                records, and generate real-time analytics with
                enterprise-grade biometric security.
              </p>

            </div>


            {/* -------------------------------------------------
                FEATURE CARDS
            ------------------------------------------------- */}

            <div className="space-y-3.5">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="login-feature-card flex items-start gap-4 rounded-2xl p-4"
                  >

                    {/* Icon */}

                    <div className="login-feature-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-indigo-600">

                      <Icon
                        size={20}
                        strokeWidth={2}
                      />

                    </div>


                    {/* Content */}

                    <div className="min-w-0">

                      <h3 className="text-xs font-bold tracking-tight text-slate-900">
                        {feature.title}
                      </h3>

                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {feature.description}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>


          {/* -------------------------------------------------
              FOOTER
          ------------------------------------------------- */}

          <div className="relative z-10 text-xs font-medium text-slate-400">
            Powered by TEAM LAZY • v1.0.0
          </div>

        </section>


        {/* ===================================================
            RIGHT LOGIN SECTION
        =================================================== */}

        <section className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-12 xl:px-16">

          <div className="w-full max-w-md">

            {/* -------------------------------------------------
                MOBILE BRAND
            ------------------------------------------------- */}

            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">

              <div className="login-brand-logo flex h-10 w-10 items-center justify-center rounded-2xl text-white">

                <GraduationCap
                  size={22}
                  strokeWidth={2.2}
                />

              </div>

              <div>

                <p className="text-sm font-bold tracking-tight text-slate-900">
                  Face Attendance System
                </p>

                <p className="text-[11px] text-slate-500">
                  Institutional Portal
                </p>

              </div>

            </div>


            {/* -------------------------------------------------
                LOGIN CARD
            ------------------------------------------------- */}

            <div className="login-card rounded-3xl p-7 sm:p-9">

              {/* Header */}

              <div className="mb-6">

                <div className="login-main-icon mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-indigo-600">

                  <ScanFace
                    size={24}
                    strokeWidth={2}
                  />

                </div>


                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>


                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Enter your credentials to access the attendance dashboard.
                </p>

              </div>


              {/* -------------------------------------------------
                  EXISTING LOGIN FORM
                  FUNCTIONALITY UNCHANGED
              ------------------------------------------------- */}

              <LoginForm />


              {/* -------------------------------------------------
                  SECURITY DIVIDER
              ------------------------------------------------- */}

              <div className="mt-6 flex items-center gap-3">

                <div className="login-security-divider h-px flex-1" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Secure Access
                </span>

                <div className="login-security-divider h-px flex-1" />

              </div>


              {/* Security message */}

              <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                Protected by institutional multi-factor security.
              </p>

            </div>


            {/* -------------------------------------------------
                COPYRIGHT
            ------------------------------------------------- */}

            <p className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Face Attendance System
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}