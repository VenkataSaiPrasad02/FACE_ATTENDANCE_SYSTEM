import { useEffect, useState } from 'react';
import {
  UserRound,
  Lock,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';

export default function TeacherForm({
  initialData = null,
  onSubmit,
  onCancel
}) {

  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
      email: '',
    phone: '',
    department: ''
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
        department: initialData.department || ''
      });

    } else {

      setFormData({
        username: '',
        fullName: '',
        password: '',
              email: '',
        phone: '',
        department: ''
      });

    }

  }, [initialData]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    try {

      setSaving(true);

      if (isEdit) {

        /*
         * UPDATE:
         * Send only fields that the admin actually entered.
         *
         * Password is optional.
         * fullName is optional.
         */

        const data = {};

        if (formData.email.trim()) {
          data.email = formData.email.trim();
        }

        if (formData.phone.trim()) {
          data.phone = formData.phone.trim();
        }

        if (formData.department.trim()) {
          data.department = formData.department.trim();
        }

        if (formData.fullName.trim()) {
          data.fullName = formData.fullName.trim();
        }

        if (formData.password.trim()) {
          data.password = formData.password.trim();
        }

        await onSubmit(data);

      } else {

        /*
         * CREATE:
         * Required by backend:
         * username
         * fullName
         * password
         */

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
          setError(
            'Password must be at least 8 characters.'
          );
          return;
        }

        const data = {
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          password: formData.password,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          department: formData.department.trim() || null
        };

        await onSubmit(data);
      }

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to save teacher.'
      );

    } finally {

      setSaving(false);

    }

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Username */}

      {!isEdit && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Username
            <span className="text-red-500"> *</span>
          </label>

          <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <UserRound size={20} />
            </div>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              maxLength={50}
              placeholder="jsmith"
              className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-500">
            Used to log in. Cannot be changed later.
          </p>
        </div>
      )}

      {isEdit && initialData?.username && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Username
          </label>
          <div className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-500">
            {initialData.username}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Username cannot be changed.</p>
        </div>
      )}

      {/* Full name */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Full name
          {!isEdit && <span className="text-red-500"> *</span>}
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <UserRound size={20} />
          </div>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={50}
            placeholder={
              isEdit
                ? 'Leave blank to keep current name'
                : 'John Smith'
            }
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        {isEdit && (
          <p className="mt-1.5 text-xs text-slate-500">
            Leave blank if you don't want to change it.
          </p>
        )}
      </div>

      {/* Password */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Password
          {!isEdit && <span className="text-red-500"> *</span>}
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <Lock size={20} />
          </div>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            placeholder={
              isEdit
                ? 'Leave blank to keep current password'
                : 'Minimum 8 characters'
            }
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        {isEdit && (
          <p className="mt-1.5 text-xs text-slate-500">
            Leave blank if you don't want to change the password.
          </p>
        )}
      </div>

      {/* Email */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <Mail size={20} />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={100}
            placeholder="john@college.edu"
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Phone */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Phone
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <Phone size={20} />
          </div>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={20}
            placeholder="9876543210"
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Department */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Department
        </label>

        <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
            <Building2 size={20} />
          </div>

          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            maxLength={100}
            placeholder="Computer Science"
            className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Buttons */}
      {/* Buttons */}
<div className="grid w-full grid-cols-4 gap-4 pt-5">

  {/* Cancel */}
  <button
    type="button"
    onClick={onCancel}
    disabled={saving}
    className="
      col-span-1
      h-11
      rounded-xl
      bg-gradient-to-r from-red-500 to-rose-600
      px-4
      text-sm font-semibold text-white
      shadow-md shadow-red-500/15
      transition-all duration-200
      hover:from-red-600 hover:to-rose-700
      hover:shadow-lg hover:shadow-red-500/20
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
  >
    Cancel
  </button>

  {/* Create / Update */}
  <button
    type="submit"
    disabled={saving}
    className="
      col-span-3
      h-11
      rounded-xl
      bg-gradient-to-r from-blue-600 to-indigo-600
      px-4
      text-sm font-semibold text-white
      shadow-md shadow-blue-500/15
      transition-all duration-200
      hover:from-blue-700 hover:to-indigo-700
      hover:shadow-lg hover:shadow-blue-500/20
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
  >
    {saving && (
      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white align-[-3px]" />
    )}

    {saving
      ? 'Saving...'
      : isEdit
        ? 'Update Teacher'
        : 'Create Teacher'}
  </button>

</div>


    </form>
  );
}