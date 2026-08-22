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

  // =========================================================
  // REQUEST OTP
  // =========================================================
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

  // =========================================================
  // VERIFY + RESET
  // =========================================================
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

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(getMessage(err, 'The OTP could not be verified. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESEND OTP
  // =========================================================
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

  // =========================================================
  // BACK TO USERNAME
  // =========================================================
  const goBackToUsername = () => {
    setStep('username');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setSecondsLeft(0);
  };

  return (
    <div className="forgot-page relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 antialiased sm:px-6">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="forgot-orb forgot-orb-1" />
        <div className="forgot-orb forgot-orb-2" />
        <div className="forgot-orb forgot-orb-3" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/70 to-cyan-50/80" />
      </div>

      {/* =====================================================
          CENTERED CONTENT COLUMN
      ====================================================== */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center">

        {/* BRAND */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap size={23} strokeWidth={2.2} />
          </div>

          <div className="text-left">
            <p className="text-sm font-bold leading-tight tracking-tight text-slate-900">
              Face Attendance System
            </p>
            <p className="text-[11px] leading-tight text-slate-500">
              Account Recovery Portal
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="forgot-card relative w-full overflow-hidden rounded-[1.75rem] p-8 sm:p-10">

          {/* Animated card background */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]">
            <div className="forgot-card-orb forgot-card-orb-1" />
            <div className="forgot-card-orb forgot-card-orb-2" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/65 to-indigo-50/70" />
          </div>

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col">

            {/* HEADER */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                {step === 'username' ? <KeyRound size={26} /> : <MailCheck size={26} />}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {step === 'username' ? 'Forgot password?' : 'Reset your password'}
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {step === 'username'
                  ? 'Enter your username to receive an OTP code.'
                  : `Verification code sent to ${maskedEmail}.`}
              </p>
            </div>

            {/* Alerts */}
            {error && <AlertBox message={error} />}
            {success && <SuccessBox message={success} />}

            {/* =================================================
                USERNAME STEP
            ================================================== */}
            {step === 'username' ? (
              <form onSubmit={requestOtp} className="flex flex-col gap-6">

                {/* Username */}
                <div>
                  <label
                    htmlFor="forgot-username"
                    className="mb-2 block text-xs font-semibold tracking-tight text-slate-700"
                  >
                    Username
                  </label>

                  <div className="group flex h-13 w-full items-center rounded-xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur-md transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-400 transition-colors group-focus-within:text-indigo-600">
                      <User size={18} />
                    </div>

                    <input
                      id="forgot-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      autoComplete="username"
                      autoFocus
                      className="h-full w-full bg-transparent pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Information */}
                <div className="flex items-start gap-3 rounded-xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/70 via-blue-50/60 to-cyan-50/60 px-4 py-3.5">
                  <MailCheck size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    We'll send a 6-digit verification code to your registered email address.
                  </p>
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  iconRight={ArrowRight}
                  className="h-13 w-full shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25"
                >
                  {loading ? 'Sending code...' : 'Send Recovery Code'}
                </Button>
              </form>
            ) : (
              /* =================================================
                 OTP STEP
              ================================================== */
              <form onSubmit={verifyAndReset} className="flex flex-col gap-6">

                <div className="space-y-5">
                  {/* OTP */}
                  <div>
                    <label htmlFor="otp" className="mb-2 block text-xs font-semibold text-slate-700">
                      6-Digit Verification Code
                    </label>

                    <div className="group flex h-13 w-full items-center rounded-xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur-md focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                      <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-400">
                        <MailCheck size={18} />
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
                        autoFocus
                        className="h-full w-full bg-transparent px-3 text-center text-xl font-bold tracking-[0.4em] text-slate-900 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <PasswordField
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    setValue={setNewPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                    placeholder="At least 8 characters"
                  />

                  <PasswordField
                    id="confirm-password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    iconRight={CheckCircle2}
                    className="h-13 w-full shadow-lg shadow-indigo-500/20"
                  >
                    {loading ? 'Changing password...' : 'Reset Password'}
                  </Button>

                  <div className="flex items-center justify-between rounded-xl border border-indigo-100/70 bg-gradient-to-r from-indigo-50/70 via-blue-50/60 to-cyan-50/60 px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">
                      {secondsLeft > 0 ? `Expires in ${formatTimer()}` : 'Code expired'}
                    </span>

                    <button
                      type="button"
                      disabled={secondsLeft > 0 || resending}
                      onClick={resendOtp}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={goBackToUsername}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Use a different username
                  </button>
                </div>
              </form>
            )}

            {/* =================================================
                BOTTOM
            ================================================== */}
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200/70" />
                <span className="rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  Secure Recovery
                </span>
                <div className="h-px flex-1 bg-slate-200/70" />
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/55 px-4 py-3 text-xs font-semibold text-slate-500 backdrop-blur-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-600"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Face Attendance System
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */
function PasswordField({ id, label, value, setValue, show, setShow, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div className="group flex h-13 w-full items-center rounded-xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur-md transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-400 group-focus-within:text-indigo-600">
          <Lock size={18} />
        </div>

        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          className="h-full w-full bg-transparent pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ALERT
========================================================= */
function AlertBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-red-700">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );
}

/* =========================================================
   SUCCESS
========================================================= */
function SuccessBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-700">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );
}