import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

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
    <AuthShell>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          {step === 'username' ? (
            <KeyRound size={24} className="text-blue-600" />
          ) : (
            <MailCheck size={24} className="text-blue-600" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {step === 'username' ? 'Forgot password?' : 'Verify your OTP'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {step === 'username'
              ? 'Enter your username and we will send an OTP to your registered email.'
              : `OTP sent to ${maskedEmail}.`}
          </p>
        </div>
      </div>

      {error && <AlertBox message={error} />}
      {success && <SuccessBox message={success} />}

      {step === 'username' ? (
        <form onSubmit={requestOtp} className="space-y-5">
          <Field
            id="forgot-username"
            label="Username"
            icon={User}
            value={username}
            onChange={setUsername}
            placeholder="Enter your username"
            autoComplete="username"
          />

          <PrimaryButton loading={loading} loadingText="Sending OTP...">
            Send OTP <ArrowRight size={18} />
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={verifyAndReset} className="space-y-5">
          <Field
            id="otp"
            label="OTP"
            icon={MailCheck}
            value={otp}
            onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            show={showPassword}
            setShow={setShowPassword}
            placeholder="Enter your new password"
            autoComplete="new-password"
          />

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
            placeholder="Confirm your new password"
            autoComplete="new-password"
          />

          <PrimaryButton loading={loading} loadingText="Changing password...">
            Reset Password <CheckCircle2 size={18} />
          </PrimaryButton>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs">
            <span className="font-medium text-slate-500">
              {secondsLeft > 0 ? `OTP expires in ${formatTimer()}` : 'OTP expired'}
            </span>
            <button
              type="button"
              disabled={secondsLeft > 0 || resending}
              onClick={resendOtp}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              Resend OTP
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
            className="w-full text-center text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            Use a different username
          </button>
        </form>
      )}

      <div className="mt-7 border-t border-slate-200 pt-5 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Lock size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white">FACE ATTENDANCE</p>
              <p className="text-xs text-slate-400">Secure account recovery</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.97] p-7 shadow-2xl shadow-black/30 sm:p-9">
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">© 2026 Face Attendance System</p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ id, label, icon: Icon, value, onChange, placeholder, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:border-blue-100 group-focus-within:text-blue-600">
          <Icon size={20} />
        </div>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="h-full w-full bg-transparent px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, setShow, placeholder, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:border-blue-100 group-focus-within:text-blue-600">
          <Lock size={20} />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="h-full w-full bg-transparent pl-4 pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="flex w-12 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PrimaryButton({ children, loading, loadingText }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { y: -1 } : undefined}
      whileTap={!loading ? { scale: 0.99 } : undefined}
      className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingText}
        </span>
      ) : children}
    </motion.button>
  );
}

function AlertBox({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
      <p className="text-xs leading-5 text-red-700">{message}</p>
    </motion.div>
  );
}

function SuccessBox({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
      <p className="text-xs leading-5 text-emerald-700">{message}</p>
    </motion.div>
  );
}
