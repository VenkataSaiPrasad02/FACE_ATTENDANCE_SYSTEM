import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function LoginForm() {
  const {
    login,
    verifyLoginOtp,
    resendLoginOtp,
  } = useAuth();

  const navigate = useNavigate();

  // -----------------------------
  // Login state
  // -----------------------------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // -----------------------------
  // OTP state
  // -----------------------------
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // -----------------------------
  // Common state
  // -----------------------------
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // -----------------------------
  // OTP resend countdown
  // -----------------------------
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // =========================================================
  // STEP 1 — Username + Password
  // =========================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(username.trim(), password);

      if (data?.otpRequired) {
        setMaskedEmail(data?.maskedEmail || '');
        setOtpStep(true);
        setOtp('');
        setPassword('');
        setSuccess(data?.message || 'OTP sent to your registered email.');
        setResendCooldown(30);
        return;
      }

      if (data?.token) {
        navigate('/');
        return;
      }

      setError('OTP verification is required to complete login.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STEP 2 — Verify OTP
  // =========================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      await verifyLoginOtp(username.trim(), cleanOtp);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid or expired OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Resend OTP
  // =========================================================
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !username.trim()) return;

    setError('');
    setSuccess('');
    setResending(true);

    try {
      const data = await resendLoginOtp(username.trim());
      setMaskedEmail(data?.maskedEmail || maskedEmail);
      setSuccess(data?.message || 'A new OTP has been sent to your registered email.');
      setOtp('');
      setResendCooldown(30);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to resend OTP.'
      );
    } finally {
      setResending(false);
    }
  };

  // =========================================================
  // Return to username/password
  // =========================================================
  const handleChangeUsername = () => {
    setOtpStep(false);
    setOtp('');
    setMaskedEmail('');
    setError('');
    setSuccess('');
    setResendCooldown(0);
  };

  // =========================================================
  // OTP SCREEN
  // =========================================================
  if (otpStep) {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
        {/* Error Alert */}
        {error && <AlertBox message={error} />}

        {/* Success Alert */}
        {success && <SuccessBox message={success} />}

        {/* Header Information */}
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Two-Factor Authentication
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              We sent a 6-digit code to your registered email
              {maskedEmail ? ` (${maskedEmail})` : '.'}
            </p>
          </div>
        </div>

        {/* OTP Input Field */}
        <div>
          <label
            htmlFor="login-otp"
            className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
          >
            Enter 6-Digit Code
          </label>

          <div className="group relative flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600">
              <ShieldCheck size={18} />
            </div>

            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value);
              }}
              placeholder="••••••"
              required
              className="h-full w-full bg-transparent px-3 text-center text-lg font-bold tracking-[0.4em] text-slate-900 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300"
              autoFocus
            />
          </div>

          <p className="mt-1.5 text-[11px] text-slate-400">
            Code expires in 5 minutes.
          </p>
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={otp.length !== 6}
          iconRight={ArrowRight}
          className="w-full"
        >
          {loading ? 'Verifying Code...' : 'Verify & Continue'}
        </Button>

        {/* Resend Actions */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <RefreshCw
              size={13}
              className={resending ? 'animate-spin' : ''}
            />
            {resending
              ? 'Sending code...'
              : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend Code'}
          </button>
        </div>

        {/* Back to username */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleChangeUsername}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft size={14} />
            Use a different account
          </button>
        </div>
      </form>
    );
  }

  // =========================================================
  // STEP 1 — USERNAME + PASSWORD
  // =========================================================
  return (
    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
      {/* Error Alert */}
      {error && <AlertBox message={error} />}

      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
        >
          Username
        </label>

        <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
          <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <User size={17} />
          </div>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            autoComplete="username"
            className="h-full w-full bg-transparent pr-3.5 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 tracking-tight"
          >
            Password
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>

        <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
          <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Lock size={17} />
          </div>

          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete="current-password"
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

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        iconRight={ArrowRight}
        className="w-full mt-2"
      >
        {loading ? 'Checking credentials...' : 'Sign In'}
      </Button>
    </form>
  );
}

function AlertBox({ message }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50/80 p-3 text-red-700 animate-fade-in shadow-xs">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
      <p className="text-xs leading-relaxed font-medium">{message}</p>
    </div>
  );
}

function SuccessBox({ message }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/80 p-3 text-emerald-700 animate-fade-in shadow-xs">
      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      <p className="text-xs leading-relaxed font-medium">{message}</p>
    </div>
  );
}
