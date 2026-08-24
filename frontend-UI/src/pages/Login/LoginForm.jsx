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

  // =========================================================
  // LOGIN STATE
  // =========================================================

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================
  // OTP STATE
  // =========================================================

  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // =========================================================
  // COMMON STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // OTP COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // =========================================================
  // ERROR MESSAGE HELPER
  // =========================================================

  const extractErrorMessage = (err, fallback) => {
    const response = err?.response;
    const data = response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    return (
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.errors?.message ||
      err?.message ||
      fallback
    );
  };

  // =========================================================
  // LOGIN SUCCESS SOUND
  // =========================================================

  const playLoginSuccessSound = () => {
    try {
      const audio = new Audio(
        '/sounds/login-success.mp3'
      );

      audio.volume = 0.6;

      audio.currentTime = 0;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(
            'Unable to play login success sound:',
            err
          );
        });
      }

    } catch (err) {
      console.warn(
        'Login success audio error:',
        err
      );
    }
  };

  // =========================================================
  // STEP 1 — LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const cleanUsername = username.trim();

    if (!cleanUsername) {
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
        cleanUsername,
        password
      );

      // =====================================================
      // BACKEND RETURNED ERROR OBJECT
      // =====================================================

      if (
        data?.status === 401 ||
        data?.status === 403 ||
        data?.success === false ||
        data?.error ||
        data?.message === 'Invalid credentials'
      ) {
        setError(
          data?.message ||
          data?.error ||
          'Wrong username or password.'
        );

        return;
      }

      // =====================================================
      // OTP REQUIRED
      // =====================================================

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

        setResendCooldown(30);

        return;
      }

      // =====================================================
      // DIRECT LOGIN
      // =====================================================

      if (data?.token) {

        // 🔊 Successful login sound
        playLoginSuccessSound();

        setTimeout(() => {
          navigate(
            // First-login guard: force the password swap immediately.
            data.mustChangePassword
              ? '/change-password'
              : '/',
            { replace: true }
          );
        }, 400);

        return;
      }

      // =====================================================
      // UNKNOWN RESPONSE
      // =====================================================

      setError(
        'Wrong username or password.'
      );

    } catch (err) {

      console.error(
        'LOGIN ERROR:',
        err
      );

      setError(
        extractErrorMessage(
          err,
          'Wrong username or password.'
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STEP 2 — VERIFY OTP
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

      // =====================================================
      // VERIFY OTP
      // =====================================================

      const data = await verifyLoginOtp(
        username.trim(),
        cleanOtp
      );

      // =====================================================
      // 🎉 LOGIN SUCCESS
      // =====================================================

      playLoginSuccessSound();

      setTimeout(() => {
        navigate(
          data?.mustChangePassword
            ? '/change-password'
            : '/',
          { replace: true }
        );
      }, 400);

    } catch (err) {

      console.error(
        'OTP verification error:',
        err
      );

      setError(
        extractErrorMessage(
          err,
          'Invalid or expired OTP.'
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResendOtp = async () => {

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
        await resendLoginOtp(
          username.trim()
        );

      setMaskedEmail(
        data?.maskedEmail ||
        maskedEmail
      );

      setSuccess(
        data?.message ||
        'A new OTP has been sent to your registered email.'
      );

      setOtp('');
      setResendCooldown(30);

    } catch (err) {

      console.error(
        'Resend OTP error:',
        err
      );

      setError(
        extractErrorMessage(
          err,
          'Unable to resend OTP.'
        )
      );

    } finally {
      setResending(false);
    }
  };

  // =========================================================
  // RETURN TO LOGIN
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
        className="space-y-6 animate-fade-in"
      >

        {/* ERROR */}

        {error && (
          <AlertBox message={error} />
        )}

        {/* SUCCESS */}

        {success && (
          <SuccessBox message={success} />
        )}

        {/* OTP INFORMATION */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-cyan-300/20
            bg-gradient-to-br
            from-[#111b3d]/90
            via-[#0c1430]/85
            to-[#0a1229]/80
            p-5
            shadow-card
            backdrop-blur-md
          "
        >

          <div
            className="
              absolute
              -right-10
              -top-10
              h-24
              w-24
              rounded-full
              bg-cyan-400/10
              blur-2xl
            "
          />

          <div className="relative flex items-start gap-3">

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
                text-white
                shadow-glow-sm
                border
                border-cyan-300/30
              "
            >
              <Mail size={18} />
            </div>

            <div>

              <p className="text-xs font-bold text-white">
                Two-Factor Authentication
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                We sent a 6-digit code to your registered
                email
                {maskedEmail
                  ? ` (${maskedEmail})`
                  : '.'}
              </p>

            </div>

          </div>

        </div>


        {/* OTP INPUT */}

        <div>

          <label
            htmlFor="login-otp"
            className="
              mb-2
              block
              text-xs
              font-semibold
              tracking-tight
              text-slate-300
            "
          >
            Enter 6-Digit Code
          </label>

          <div
            className="
              group
              relative
              flex
              h-14
              w-full
              items-center
              rounded-xl
              border
              border-white/10
              bg-[#0a1026]/80
              backdrop-blur-md
              transition-all
              duration-200
              focus-within:border-cyan-300/60
              focus-within:ring-4
              focus-within:ring-cyan-400/10
            "
          >

            <div
              className="
                flex
                items-center
                justify-center
                pl-4
                pr-2
                text-slate-500
                transition-colors
                group-focus-within:text-cyan-300
              "
            >
              <ShieldCheck size={19} />
            </div>

            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(
                  e.target.value
                    .replace(/\D/g, '')
                );
              }}
              placeholder="••••••"
              required
              autoFocus
              className="
                h-full
                w-full
                bg-transparent
                px-3
                text-center
                text-xl
                font-bold
                tracking-[0.45em]
                text-slate-100
                outline-none
                placeholder:text-sm
                placeholder:font-normal
                placeholder:tracking-normal
                placeholder:text-slate-600
              "
            />

          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Code expires in 5 minutes.
          </p>

        </div>


        {/* VERIFY */}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={otp.length !== 6}
          iconRight={ArrowRight}
          className="
            mt-3
            h-12
            w-full
            shadow-glow-sm
          "
        >
          {loading
            ? 'Verifying Code...'
            : 'Verify & Continue'}
        </Button>


        {/* RESEND */}

        <div className="flex justify-center pt-2">

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={
              resending ||
              resendCooldown > 0
            }
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-3
              py-2
              text-xs
              font-semibold
              text-cyan-300
              transition-all
              hover:bg-cyan-400/10
              hover:text-cyan-200
              disabled:cursor-not-allowed
              disabled:text-slate-600
            "
          >

            <RefreshCw
              size={13}
              className={
                resending
                  ? 'animate-spin'
                  : ''
              }
            />

            {resending
              ? 'Sending code...'
              : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend Code'}

          </button>

        </div>


        {/* BACK */}

        <div className="pt-1 text-center">

          <button
            type="button"
            onClick={handleChangeUsername}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-400
              transition-all
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <ArrowLeft size={14} />
            Use a different account
          </button>

        </div>

      </form>
    );
  }

  // =========================================================
  // NORMAL LOGIN SCREEN
  // =========================================================

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5 animate-fade-in"
    >

      {/* ERROR */}

      {error && (
        <AlertBox message={error} />
      )}


      {/* USERNAME */}

      <div>

        <label
          htmlFor="username"
          className="
            mb-2
            block
            text-xs
            font-semibold
            tracking-tight
            text-slate-300
          "
        >
          Username / Roll Number
        </label>

        <div
          className="
            group
            relative
            flex
            h-13
            w-full
            items-center
            rounded-xl
            border
            border-white/10
            bg-[#0a1026]/80
            backdrop-blur-md
            transition-all
            duration-200
            focus-within:border-cyan-300/60
            focus-within:ring-4
            focus-within:ring-cyan-400/10
          "
        >

          <div
            className="
              flex
              items-center
              justify-center
              pl-4
              pr-2
              text-slate-500
              transition-colors
              group-focus-within:text-cyan-300
            "
          >
            <User size={18} />
          </div>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Enter username or roll number"
            required
            autoComplete="username"
            className="
              h-full
              w-full
              bg-transparent
              pr-4
              text-sm
              font-medium
              text-slate-100
              outline-none
              placeholder:text-slate-600
            "
          />

        </div>

      </div>


      {/* PASSWORD */}

      <div>

        <label
          htmlFor="password"
          className="
            mb-2
            block
            text-xs
            font-semibold
            tracking-tight
            text-slate-300
          "
        >
          Password
        </label>

        <div
          className="
            group
            relative
            flex
            h-13
            w-full
            items-center
            rounded-xl
            border
            border-white/10
            bg-[#0a1026]/80
            backdrop-blur-md
            transition-all
            duration-200
            focus-within:border-cyan-300/60
            focus-within:ring-4
            focus-within:ring-cyan-400/10
          "
        >

          <div
            className="
              flex
              items-center
              justify-center
              pl-4
              pr-2
              text-slate-500
              transition-colors
              group-focus-within:text-cyan-300
            "
          >
            <Lock size={18} />
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
            placeholder="Enter password"
            required
            autoComplete="current-password"
            className="
              h-full
              w-full
              bg-transparent
              pr-2
              text-sm
              font-medium
              text-slate-100
              outline-none
              placeholder:text-slate-600
            "
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
            className="
              flex
              h-full
              w-11
              shrink-0
              items-center
              justify-center
              rounded-r-xl
              text-slate-500
              transition-colors
              hover:bg-cyan-400/10
              hover:text-cyan-300
            "
          >
            {showPassword ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}
          </button>

        </div>


        {/* FORGOT PASSWORD */}

        <div className="mt-2.5 flex justify-end">

          <Link
            to="/forgot-password"
            className="
              text-xs
              font-semibold
              text-cyan-300
              transition-all
              hover:text-cyan-200
              hover:underline
              underline-offset-2
            "
          >
            Forgot password?
          </Link>

        </div>

      </div>


      {/* SIGN IN */}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        iconRight={ArrowRight}
        className="
          mt-4
          h-12
          w-full
          shadow-glow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-glow
        "
      >
        {loading
          ? 'Checking credentials...'
          : 'Sign In'}
      </Button>


      {/* SECURITY */}

      <div
        className="
          mt-5
          rounded-xl
          border
          border-white/[0.08]
          bg-gradient-to-r
          from-blue-500/[0.08]
          via-cyan-500/[0.06]
          to-violet-500/[0.08]
          px-4
          py-3
          text-center
        "
      >
        <p className="text-[10px] font-medium text-slate-500">
          🔐 Secure institutional authentication
        </p>
      </div>

    </form>
  );
}


/* =========================================================
   ALERT
========================================================= */

function AlertBox({ message }) {
  return (
    <div
      className="
        flex
        items-start
        gap-2.5
        rounded-xl
        border
        border-rose-300/25
        bg-rose-500/10
        p-3
        text-rose-300
        shadow-sm
        animate-fade-in
      "
    >

      <AlertCircle
        size={16}
        className="
          mt-0.5
          shrink-0
          text-rose-400
        "
      />

      <p
        className="
          text-xs
          font-medium
          leading-relaxed
        "
      >
        {message}
      </p>

    </div>
  );
}


/* =========================================================
   SUCCESS
========================================================= */

function SuccessBox({ message }) {
  return (
    <div
      className="
        flex
        items-start
        gap-2.5
        rounded-xl
        border
        border-emerald-300/25
        bg-emerald-400/10
        p-3
        text-emerald-300
        shadow-sm
        animate-fade-in
      "
    >

      <ShieldCheck
        size={16}
        className="
          mt-0.5
          shrink-0
          text-emerald-400
        "
      />

      <p
        className="
          text-xs
          font-medium
          leading-relaxed
        "
      >
        {message}
      </p>

    </div>
  );
}
