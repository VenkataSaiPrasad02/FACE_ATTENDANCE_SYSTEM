import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, RotateCcw, LogIn, AlertOctagon, ShieldAlert, ServerCrash, WifiOff, FileQuestion } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ErrorPage({
  statusCode = '404',
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or may have been moved.",
  icon: IconProp,
  type = 'notFound',
  onRetry,
}) {
  const navigate = useNavigate();

  const iconMap = {
    '404': FileQuestion,
    '401': LogIn,
    '403': ShieldAlert,
    '500': ServerCrash,
    '502': WifiOff,
    '503': AlertOctagon,
  };

  const Icon = IconProp || iconMap[statusCode] || FileQuestion;

  const gradientMap = {
    '404': 'from-blue-500 to-indigo-600',
    '401': 'from-amber-500 to-orange-600',
    '403': 'from-rose-500 to-red-600',
    '500': 'from-red-500 to-rose-600',
    '502': 'from-purple-500 to-indigo-600',
    '503': 'from-amber-500 to-yellow-600',
  };

  const gradient = gradientMap[statusCode] || 'from-blue-500 to-indigo-600';

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center animate-fade-in">
        {/* Status Code Pill with Gradient */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-1.5 shadow-xs backdrop-blur-md">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-xs`}>
            <Icon size={13} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black tracking-wider text-slate-800 uppercase">
            Error {statusCode}
          </span>
        </div>

        {/* Large Decorative Status */}
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 tabular-nums">
          {statusCode}
        </h1>

        {/* Title */}
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 max-w-sm">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {statusCode === '401' ? (
            <Button
              variant="primary"
              size="lg"
              icon={LogIn}
              onClick={() => navigate('/login')}
              className="shadow-sm"
            >
              Sign In
            </Button>
          ) : statusCode === '500' || statusCode === '502' || statusCode === '503' ? (
            <Button
              variant="primary"
              size="lg"
              icon={RotateCcw}
              onClick={onRetry || (() => window.location.reload())}
              className="shadow-sm"
            >
              Try Again
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={Home}
              onClick={() => navigate('/')}
              className="shadow-sm"
            >
              Return Home
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        {/* Footer brand attribution */}
        <p className="mt-12 text-[11px] font-medium text-slate-400">
          Smart Attendance System • Institutional Biometrics
        </p>
      </div>
    </div>
  );
}
