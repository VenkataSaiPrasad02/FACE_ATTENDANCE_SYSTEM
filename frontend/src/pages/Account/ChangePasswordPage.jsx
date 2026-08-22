import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(data?.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to change your password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs">
            <KeyRound size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Change password
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Update your account password securely.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card glass className="p-6 sm:p-8">
        {error && <AlertBox message={error} />}
        {success && <SuccessBox message={success} />}

        <form onSubmit={submit} className="space-y-4">
          <PasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            setShow={setShowCurrent}
            autoComplete="current-password"
            placeholder="Enter current password"
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            setShow={setShowConfirm}
            autoComplete="new-password"
            placeholder="Re-enter new password"
          />

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
            Passwords must contain at least 8 characters. Never share your password or recovery OTP codes with anyone.
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              iconRight={CheckCircle2}
              className="w-full"
            >
              {loading ? 'Changing password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, setShow, placeholder, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight">
        {label}
      </label>
      <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <Lock size={17} />
        </div>

        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="h-full w-full bg-transparent pr-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="flex h-full w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
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
