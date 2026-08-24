import React, { useEffect, useState } from 'react';
import {
  UserRound,
  Lock,
  Mail,
  Phone,
  Building2,
  KeyRound,
  Shield,
} from 'lucide-react';
import Button from '../../components/ui/Button';

export default function TeacherForm({
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    email: '',
    phone: '',
    department: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        fullName: '',
        password: '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
      });
    } else {
      setFormData({
        username: '',
        fullName: '',
        password: '',
        email: '',
        phone: '',
        department: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);

      if (isEdit) {
        const data = {};
        if (formData.email.trim()) data.email = formData.email.trim();
        if (formData.phone.trim()) data.phone = formData.phone.trim();
        if (formData.department.trim()) data.department = formData.department.trim();
        if (formData.fullName.trim()) data.fullName = formData.fullName.trim();
        if (formData.password.trim()) data.password = formData.password.trim();

        await onSubmit(data);
      } else {
        if (!formData.username.trim()) {
          setError('Username is required.');
          return;
        }
        if (!formData.fullName.trim()) {
          setError('Full name is required.');
          return;
        }
        if (!formData.password.trim()) {
          setError('Password is required.');
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }

        const data = {
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          password: formData.password,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department.trim(),
        };
        await onSubmit(data);
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to save faculty record.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {error && (
        <div className="rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* SECTION 1: Identity & Credentials */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-4 shadow-card backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-cyan-300">
              <UserRound size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white sm:text-sm">
                Faculty Account &amp; Identity
              </h4>
              <p className="text-[11px] text-slate-500">
                Staff member login credentials and identity
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
            Step 1
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Username */}
          {!isEdit ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                System Username <span className="text-rose-400">*</span>
              </label>
              <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                  <UserRound size={16} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. jsmith"
                  required
                  className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                System Username
              </label>
              <div className="flex h-10 w-full items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-400">
                @{initialData.username}
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className={isEdit ? '' : ''}>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Full Faculty Name {!isEdit && <span className="text-rose-400">*</span>}
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <UserRound size={16} />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={50}
                placeholder={isEdit ? 'Leave blank to keep unchanged' : 'e.g. Dr. John Smith'}
                required={!isEdit}
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              {isEdit ? 'Update Password (Optional)' : 'Access Password'} {!isEdit && <span className="text-rose-400">*</span>}
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                placeholder={isEdit ? 'Leave empty to retain existing password' : 'Minimum 8 characters'}
                required={!isEdit}
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Department & Contact Info */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-4 shadow-card backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-300/25 bg-sky-400/10 text-sky-300">
              <Building2 size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white sm:text-sm">
                Department &amp; Communication
              </h4>
              <p className="text-[11px] text-slate-500">
                Academic department and contact details
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
            Step 2
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Department */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Department / Faculty Unit
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Building2 size={16} />
              </div>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Computer Science & Engineering"
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Institutional Email
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                placeholder="faculty@institution.edu"
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Office / Mobile Phone
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Phone size={16} />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="+91 9876543210"
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse gap-2.5 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
            className="w-full font-semibold sm:w-auto"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={saving}
          className="w-full font-bold sm:w-auto"
        >
          {isEdit ? 'Update Faculty Member' : 'Register Faculty Member'}
        </Button>
      </div>
    </form>
  );
}
