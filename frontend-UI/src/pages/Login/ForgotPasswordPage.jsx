import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Check,
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/40 via-transparent to-[#050816]/55" />
      </div>

      {/* =====================================================
          CENTERED CONTENT COLUMN
      ====================================================== */}
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center animate-slide-up">

        {/* BRAND */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 text-white shadow-glow-sm border border-cyan-300/30">
            <GraduationCap size={23} strokeWidth={2.2} />
          </div>

          <div className="text-left">
            <p className="text-sm font-bold leading-tight tracking-tight text-white">
              Face Attendance System
            </p>
            <p className="text-[11px] leading-tight text-slate-400">
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
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/20" />
          </div>

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col">

            {/* HEADER */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 text-white shadow-glow-sm border border-cyan-300/30">
                {step === 'username' ? <KeyRound size={26} /> : <MailCheck size={26} />}
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                {step === 'username' ? 'Forgot password?' : 'Reset your password'}
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {step === 'username'
                  ? 'Enter your username to receive an OTP code.'
                  : `Verification code sent to ${maskedEmail}.`}
              </p>
            </div>

            {/* STEP INDICATOR */}
            <StepIndicator
              step={step}
              otpFilled={step === 'otp' && /^\d{6}$/.test(otp.trim())}
            />

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
                    className="mb-2 block text-xs font-semibold tracking-tight text-slate-300"
                  >
                    Username
                  </label>

                  <div className="group flex h-13 w-full items-center rounded-xl border border-white/10 bg-[#0a1026]/80 backdrop-blur-md transition-all duration-200 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
                    <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-500 transition-colors group-focus-within:text-cyan-300">
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
                      className="h-full w-full bg-transparent pr-4 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Information */}
                <div className="flex items-start gap-3 rounded-xl border border-sky-300/20 bg-sky-400/[0.07] px-4 py-3.5">
                  <MailCheck size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                  <p className="text-[11px] leading-relaxed text-slate-400">
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
                  className="h-13 w-full shadow-glow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
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
                    <label htmlFor="otp" className="mb-2 block text-xs font-semibold text-slate-300">
                      6-Digit Verification Code
                    </label>

                    <div className="group flex h-13 w-full items-center rounded-xl border border-white/10 bg-[#0a1026]/80 backdrop-blur-md focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
                      <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-500 group-focus-within:text-cyan-300">
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
                        className="h-full w-full bg-transparent px-3 text-center text-xl font-bold tracking-[0.4em] text-slate-100 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600"
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
                    className="h-13 w-full shadow-glow-sm"
                  >
                    {loading ? 'Changing password...' : 'Reset Password'}
                  </Button>

                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">
                      {secondsLeft > 0 ? `Expires in ${formatTimer()}` : 'Code expired'}
                    </span>

                    <button
                      type="button"
                      disabled={secondsLeft > 0 || resending}
                      onClick={resendOtp}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-600"
                    >
                      <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={goBackToUsername}
                    className="w-full text-center text-xs font-semibold text-slate-400 transition-colors hover:text-white"
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
                <div className="h-px flex-1 bg-white/10" />
                <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Secure Recovery
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-semibold text-slate-400 backdrop-blur-sm transition-all hover:border-cyan-300/25 hover:bg-white/[0.09] hover:text-cyan-200"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Face Attendance System
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STEP INDICATOR
======================================================== */
function StepIndicator({ step, otpFilled }) {
  const stages = [
    { key: 'username', label: 'Username', icon: User },
    { key: 'otp', label: 'OTP Code', icon: MailCheck },
    { key: 'password', label: 'New Password', icon: KeyRound },
  ];

  const getStageState = (index) => {
    if (index === 0) {
      return step === 'username' ? 'active' : 'done';
    }
    if (index === 1) {
      if (step !== 'otp') return 'pending';
      return otpFilled ? 'done' : 'active';
    }
    return step === 'otp' && otpFilled ? 'active' : 'pending';
  };

  const chipClasses = {
    done: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-300',
    active:
      'border-cyan-300/40 bg-cyan-400/10 text-cyan-200 shadow-glow-sm',
    pending: 'border-white/[0.08] bg-white/[0.03] text-slate-500',
  };

  const connectorClasses = {
    done: 'bg-emerald-300/30',
    active: 'bg-cyan-300/25',
    pending: 'bg-white/10',
  };

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {stages.map((stage, index) => {
        const state = getStageState(index);
        const StageIcon = stage.icon;

        return (
          <React.Fragment key={stage.key}>
            {index > 0 && (
              <div className={`h-px w-5 sm:w-7 ${connectorClasses[stages[index - 1] && getStageState(index - 1)]}`} />
            )}

            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-[11px] ${chipClasses[state]}`}
            >
              {state === 'done' ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <StageIcon size={12} />
              )}
              <span>{stage.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
======================================================== */
function PasswordField({ id, label, value, setValue, show, setShow, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-300">
        {label}
      </label>

      <div className="group flex h-13 w-full items-center rounded-xl border border-white/10 bg-[#0a1026]/80 backdrop-blur-md transition-all focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
        <div className="flex h-full w-12 shrink-0 items-center justify-center text-slate-500 group-focus-within:text-cyan-300">
          <Lock size={18} />
        </div>

        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          className="h-full w-full bg-transparent pr-2 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-600"
        />

        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300"
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
======================================================== */
function AlertBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-300/25 bg-rose-500/10 p-3 text-rose-300 animate-fade-in">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );
}

/* =========================================================
   SUCCESS
======================================================== */
function SuccessBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-emerald-300 animate-fade-in">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );
}
