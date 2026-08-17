import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import authService from '../../services/authService';

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
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Unable to change your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <KeyRound size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change password</h1>
            <p className="mt-1 text-sm text-slate-500">Update your account password securely.</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {error && <AlertBox message={error} />}
        {success && <SuccessBox message={success} />}

        <form onSubmit={submit} className="space-y-5">
          <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} setShow={setShowCurrent} autoComplete="current-password" />
          <PasswordField label="New password" value={newPassword} onChange={setNewPassword} show={showNew} setShow={setShowNew} autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} autoComplete="new-password" />

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
            Use at least 8 characters. Never share your password or OTP with anyone.
          </div>

          <motion.button disabled={loading} whileTap={!loading ? { scale: 0.99 } : undefined} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Changing password...</> : <><CheckCircle2 size={18} /> Change Password</>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, setShow, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:text-blue-600"><Lock size={20} /></div>
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} required className="h-full w-full bg-transparent pl-4 pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" placeholder="Enter password" {...props} />
        <button type="button" onClick={() => setShow((value) => !value)} className="flex w-12 shrink-0 items-center justify-center text-slate-400 hover:text-slate-700" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );
}

function AlertBox({ message }) {
  return <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"><AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" /><p className="text-xs leading-5 text-red-700">{message}</p></div>;
}

function SuccessBox({ message }) {
  return <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /><p className="text-xs leading-5 text-emerald-700">{message}</p></div>;
}
