import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  MailCheck,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';

const OTP_TTL_SECONDS = 2 * 60;

export default function ForgotPasswordPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('username');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const formatTimer = () => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getMessage = (err, fallback) =>
    err?.response?.data?.message || err?.response?.data?.error || fallback;

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Enter your username to continue.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.requestPasswordReset(username.trim());
      setMaskedEmail(data?.maskedEmail || data?.email || 'your registered email');
      setSecondsLeft(OTP_TTL_SECONDS);
      setStep('otp');
      setSuccess(data?.message || 'OTP sent successfully. Check your registered email.');
    } catch (err) {
      setError(getMessage(err, 'We could not start password recovery for this username.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyAndReset = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyPasswordReset({
        username: username.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccess(data?.message || 'Password changed successfully. You can now sign in.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(getMessage(err, 'The OTP could not be verified. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (secondsLeft > 0 || resending) return;

    setError('');
    setSuccess('');
    setResending(true);

    try {
      const data = await authService.resendPasswordResetOtp(username.trim());
      setSecondsLeft(OTP_TTL_SECONDS);
      setSuccess(data?.message || 'A new OTP has been sent.');
    } catch (err) {
      setError(getMessage(err, 'Unable to resend the OTP right now.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 antialiased selection:bg-indigo-500/15 selection:text-slate-900">
      {/* Ambient background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-[15%] -left-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.04] blur-3xl" />
        <div className="absolute -bottom-[15%] -right-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/[0.035] blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs">
              <GraduationCap size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                Face Attendance System
              </p>
              <p className="text-[11px] text-slate-500">
                Account Recovery Portal
              </p>
            </div>
          </div>

          {/* Recovery Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-7 shadow-xl backdrop-blur-xl sm:p-9">
            <div className="mb-6 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs">
                {step === 'username' ? (
                  <KeyRound size={22} strokeWidth={2} />
                ) : (
                  <MailCheck size={22} strokeWidth={2} />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {step === 'username' ? 'Forgot password?' : 'Reset your password'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {step === 'username'
                    ? 'Enter your username to receive an OTP code.'
                    : `Code sent to ${maskedEmail}.`}
                </p>
              </div>
            </div>

            {error && <AlertBox message={error} />}
            {success && <SuccessBox message={success} />}

            {step === 'username' ? (
              <form onSubmit={requestOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-username"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
                  >
                    Username
                  </label>

                  <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User size={17} />
                    </div>

                    <input
                      id="forgot-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your registered username"
                      required
                      autoComplete="username"
                      className="h-full w-full bg-transparent pr-3.5 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  iconRight={ArrowRight}
                  className="w-full mt-2"
                >
                  {loading ? 'Sending code...' : 'Send Recovery Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyAndReset} className="space-y-4">
                {/* OTP field */}
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
                  >
                    6-Digit Verification Code
                  </label>

                  <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <MailCheck size={17} />
                    </div>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      required
                      className="h-full w-full bg-transparent px-3 text-center text-base font-bold tracking-[0.35em] text-slate-900 outline-none placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300"
                      autoFocus
                    />
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
                  >
                    New Password
                  </label>

                  <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock size={17} />
                    </div>

                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      className="h-full w-full bg-transparent pr-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((val) => !val)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="flex h-full w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
                  >
                    Confirm New Password
                  </label>

                  <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock size={17} />
                    </div>

                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      autoComplete="new-password"
                      className="h-full w-full bg-transparent pr-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((val) => !val)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="flex h-full w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  iconRight={CheckCircle2}
                  className="w-full mt-2"
                >
                  {loading ? 'Changing password...' : 'Reset Password'}
                </Button>

                {/* Timer & Resend */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 text-xs border border-slate-200/60">
                  <span className="font-medium text-slate-500">
                    {secondsLeft > 0 ? `Expires in ${formatTimer()}` : 'Code expired'}
                  </span>

                  <button
                    type="button"
                    disabled={secondsLeft > 0 || resending}
                    onClick={resendOtp}
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 transition-colors hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                    Resend Code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep('username');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-center text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 pt-1"
                >
                  Use a different username
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Face Attendance System
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertBox({ message }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50/80 p-3 text-red-700 animate-fade-in shadow-xs">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
      <p className="text-xs leading-relaxed font-medium">{message}</p>
    </div>
  );
}

function SuccessBox({ message }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/80 p-3 text-emerald-700 animate-fade-in shadow-xs">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      <p className="text-xs leading-relaxed font-medium">{message}</p>
    </div>
  );
}
