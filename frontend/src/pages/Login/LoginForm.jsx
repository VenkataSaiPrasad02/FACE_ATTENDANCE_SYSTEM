import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  // -----------------------------
  // OTP state
  // -----------------------------

  const [otp, setOtp] =
    useState('');

  const [maskedEmail, setMaskedEmail] =
    useState('');

  const [otpStep, setOtpStep] =
    useState(false);

  const [resendCooldown, setResendCooldown] =
    useState(0);

  // -----------------------------
  // Common state
  // -----------------------------

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  // -----------------------------
  // OTP resend countdown
  // -----------------------------

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown(
        (current) =>
          current > 0
            ? current - 1
            : 0
      );
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
      const data = await login(
        username.trim(),
        password
      );

      /*
       * Backend response:
       *
       * {
       *   otpRequired: true,
       *   username: "...",
       *   maskedEmail: "...",
       *   message: "..."
       * }
       */

      if (data?.otpRequired) {
        setMaskedEmail(
          data?.maskedEmail || ''
        );

        setOtpStep(true);
        setOtp('');
        setPassword('');

        setSuccess(
          data?.message ||
            'OTP sent to your registered email.'
        );

        // Allow resend after cooldown.
        setResendCooldown(30);

        return;
      }

      /*
       * Safety fallback.
       *
       * The new backend should NOT return a JWT
       * from step 1.
       */
      if (data?.token) {
        navigate('/');
        return;
      }

      setError(
        'OTP verification is required to complete login.'
      );

    } catch (err) {
      setError(
        err?.response?.data?.message ||
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
      setError(
        'Please enter the 6-digit OTP.'
      );
      return;
    }

    setLoading(true);

    try {
      await verifyLoginOtp(
        username.trim(),
        cleanOtp
      );

      /*
       * JWT has now been stored by AuthContext.
       */
      navigate('/', {
        replace: true,
      });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
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
  console.log('🔥 RESEND CLICKED', {
    username,
    resendCooldown,
    resending,
    resendLoginOtp,
  });
  if (
    resendCooldown > 0 ||
    resending ||
    !username.trim()
  ) {
    return;
  }

  setError('');
  setSuccess('');
  setResending(true);

  try {
    const data =
      await resendLoginOtp(username.trim());

    setMaskedEmail(
      data?.maskedEmail || maskedEmail
    );

    setSuccess(
      data?.message ||
        'A new OTP has been sent to your registered email.'
    );

    setOtp('');
    setResendCooldown(30);

  } catch (err) {
    setError(
      err?.response?.data?.message ||
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
      <form
        onSubmit={handleVerifyOtp}
        className="space-y-5"
      >

        {/* Error */}
        {error && (
          <AlertBox message={error} />
        )}

        {/* Success */}
        {success && (
          <SuccessBox message={success} />
        )}

        {/* OTP Header */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Mail
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Verify your login
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                We sent a 6-digit verification
                code to your registered email
                {maskedEmail
                  ? ` (${maskedEmail})`
                  : '.'}
              </p>
            </div>

          </div>

        </div>

        {/* OTP */}

        <div>

          <label
            htmlFor="login-otp"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Enter OTP
          </label>

          <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <ShieldCheck size={20} />
            </div>

            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /\D/g,
                    ''
                  );

                setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              required
              className="h-full w-full bg-transparent px-4 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400"
              autoFocus
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            OTP expires after 5 minutes.
          </p>

        </div>

        {/* Verify */}

        <motion.button
          type="submit"
          disabled={
            loading ||
            otp.length !== 6
          }
          whileHover={
            !loading && otp.length === 6
              ? { y: -1 }
              : undefined
          }
          whileTap={
            !loading && otp.length === 6
              ? { scale: 0.99 }
              : undefined
          }
          className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >

          {!loading && (
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}

          {loading ? (
            <span className="relative flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying...
            </span>
          ) : (
            <span className="relative flex items-center gap-2">
              Verify OTP
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          )}

        </motion.button>

        {/* Resend */}

        <div className="flex items-center justify-center">
  <button
    type="button"
    onClick={handleResendOtp}
    disabled={resending || resendCooldown > 0}
    className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
  >
    <RefreshCw
      size={16}
      className={resending ? 'animate-spin' : ''}
    />

    {resending
      ? 'Sending...'
      : resendCooldown > 0
        ? `Resend OTP in ${resendCooldown}s`
        : 'Resend OTP'}
  </button>
</div>

        {/* Change username */}

        <button
          type="button"
          onClick={handleChangeUsername}
          className="mx-auto flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Change username
        </button>

      </form>
    );
  }

  // =========================================================
  // STEP 1 — USERNAME + PASSWORD
  // =========================================================

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5"
    >

      {/* Error */}

      {error && (
        <AlertBox message={error} />
      )}

      {/* Username */}

      <div>

        <label
          htmlFor="username"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Username
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <User size={20} />
          </div>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Enter your username"
            required
            autoComplete="username"
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />

        </div>

      </div>

      {/* Password */}

      <div>

        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Password
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <Lock size={20} />
          </div>

          <input
            id="password"
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="h-full w-full bg-transparent pl-4 pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            className="flex w-12 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
          >

            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}

          </button>

        </div>

      </div>

      {/* Forgot password */}

      <div className="-mt-1 flex justify-end">

        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Forgot password?
        </Link>

      </div>

      {/* Sign in */}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={
          !loading
            ? { y: -1 }
            : undefined
        }
        whileTap={
          !loading
            ? { scale: 0.99 }
            : undefined
        }
        className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {!loading && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

        {loading ? (
          <span className="relative flex items-center gap-2">

            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

            Checking credentials...

          </span>
        ) : (
          <span className="relative flex items-center gap-2">

            Sign In

            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />

          </span>
        )}

      </motion.button>

    </form>
  );
}

// =========================================================
// Shared UI
// =========================================================

function AlertBox({ message }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
    >

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100">
        <AlertCircle
          size={16}
          className="text-red-600"
        />
      </div>

      <div>

        <p className="text-sm font-semibold text-red-800">
          Sign in failed
        </p>

        <p className="mt-0.5 text-xs leading-5 text-red-600">
          {message}
        </p>

      </div>

    </motion.div>
  );
}

function SuccessBox({ message }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5"
    >

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <ShieldCheck
          size={16}
          className="text-emerald-600"
        />
      </div>

      <div>

        <p className="text-sm font-semibold text-emerald-800">
          Check your email
        </p>

        <p className="mt-0.5 text-xs leading-5 text-emerald-700">
          {message}
        </p>

      </div>

    </motion.div>
  );
}