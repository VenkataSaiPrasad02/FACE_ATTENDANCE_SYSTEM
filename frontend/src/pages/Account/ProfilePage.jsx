import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Camera,
  X,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function ProfilePage() {
  const { setProfilePhotoUrl } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // ---------------- Photo state ----------------
  const [photoUrl, setPhotoUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  const fileInputRef = useRef(null);

  // ---------------- Load profile ----------------

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await userService.getMyProfile();

        if (cancelled) return;

        setUsername(data?.username || '');
        setRole(data?.role || '');
        setFullName(data?.fullName || '');
        setEmail(data?.email || '');
        setPhotoUrl(data?.profilePhotoUrl || null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Unable to load your profile.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------- Preview cleanup ----------------

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ---------------- Update profile ----------------

  const submit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setSaving(true);

    try {
      const data = await userService.updateMyProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });

      setFullName(data?.fullName || fullName);
      setEmail(data?.email || email);

      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Select photo ----------------

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoError('');
    setPhotoSuccess('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError(
        'Only JPEG, PNG, or WebP images are allowed.'
      );

      // Allow selecting the same invalid file again.
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    // Maximum 10 MB.
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError(
        'Photo must be smaller than 10MB.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    // Release previous preview before creating a new one.
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ---------------- Cancel selected photo ----------------

  const cancelSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoError('');
    setPhotoSuccess('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ---------------- Upload photo ----------------

  const uploadPhoto = async () => {
    if (!selectedFile || photoSaving) {
      return;
    }

    setPhotoSaving(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const data =
        await userService.uploadMyProfilePhoto(
          selectedFile
        );

      const newUrl =
        data?.profilePhotoUrl || null;

      // Update Profile page immediately.
      setPhotoUrl(newUrl);

      // Update Navbar/global avatar immediately.
      setProfilePhotoUrl(newUrl);

      // Clear selected file and preview.
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setPhotoSuccess(
        'Profile photo updated.'
      );
    } catch (err) {
      setPhotoError(
        err?.response?.data?.message ||
          'Unable to upload your photo.'
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  // ---------------- Remove photo ----------------

  const removePhoto = async () => {
    if (photoSaving) {
      return;
    }

    setPhotoSaving(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      await userService.removeMyProfilePhoto();

      // Remove from Profile page.
      setPhotoUrl(null);

      // Remove from Navbar/global state.
      setProfilePhotoUrl(null);

      setPhotoSuccess(
        'Profile photo removed.'
      );
    } catch (err) {
      setPhotoError(
        err?.response?.data?.message ||
          'Unable to remove your photo.'
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  // ---------------- Render ----------------

  return (
    <div className="mx-auto max-w-2xl">

      {/* Header */}
      <div className="mb-6">

        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <UserIcon
              size={24}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and edit your account details.
            </p>
          </div>

        </div>
      </div>

      {/* ================= PHOTO SECTION ================= */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >

        {photoError && (
          <AlertBox message={photoError} />
        )}

        {photoSuccess && (
          <SuccessBox message={photoSuccess} />
        )}

        <div className="flex flex-col items-center gap-4 sm:flex-row">

          {/* Avatar */}

          <ProfileAvatar
            photoUrl={previewUrl || photoUrl}
            name={fullName || username}
            size="xl"
          />

          <div className="flex flex-1 flex-col gap-2">

            {/* Hidden file input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* No file selected */}

            {!selectedFile ? (
              <div className="flex flex-wrap gap-2">

                {/* Change Photo */}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <Camera size={16} />
                  Change Photo
                </button>

                {/* Remove Photo */}

                {photoUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={photoSaving}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                )}

              </div>
            ) : (

              /* File selected */

              <div className="flex flex-wrap items-center gap-2">

                {/* Save Photo */}

                <button
                  type="button"
                  onClick={uploadPhoto}
                  disabled={photoSaving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {photoSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Photo
                    </>
                  )}

                </button>

                {/* Cancel */}

                <button
                  type="button"
                  onClick={cancelSelection}
                  disabled={photoSaving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Cancel
                </button>

              </div>
            )}

            <p className="text-xs text-slate-400">
              JPEG, PNG, or WebP. Max 10MB.
            </p>

          </div>
        </div>

      </motion.div>

      {/* ================= PROFILE DETAILS ================= */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >

        {error && (
          <AlertBox message={error} />
        )}

        {success && (
          <SuccessBox message={success} />
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (

          <form
            onSubmit={submit}
            className="space-y-5"
          >

            {/* Username */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <div className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-500">
                {username}
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Username cannot be changed.
              </p>

            </div>

            {/* Role */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>

              <div className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-500">
                {role}
              </div>

            </div>

            {/* Full name */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </label>

              <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

                <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:text-blue-600">
                  <UserIcon size={20} />
                </div>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                  className="h-full w-full bg-transparent pl-4 pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Enter your full name"
                />

              </div>

            </div>

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <div className="group flex h-14 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

                <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:text-blue-600">
                  <Mail size={20} />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="h-full w-full bg-transparent pl-4 pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Enter your email"
                />

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Forgot-password OTPs are sent to this address.
              </p>

            </div>

            {/* Save profile */}

            <motion.button
              type="submit"
              disabled={saving}
              whileTap={
                !saving
                  ? { scale: 0.99 }
                  : undefined
              }
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Save changes
                </>
              )}

            </motion.button>

          </form>
        )}

      </motion.div>

    </div>
  );
}

// ======================================================
// Alert Box
// ======================================================

function AlertBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">

      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0 text-red-600"
      />

      <p className="text-xs leading-5 text-red-700">
        {message}
      </p>

    </div>
  );
}

// ======================================================
// Success Box
// ======================================================

function SuccessBox({ message }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">

      <CheckCircle2
        size={18}
        className="mt-0.5 shrink-0 text-emerald-600"
      />

      <p className="text-xs leading-5 text-emerald-700">
        {message}
      </p>

    </div>
  );
}