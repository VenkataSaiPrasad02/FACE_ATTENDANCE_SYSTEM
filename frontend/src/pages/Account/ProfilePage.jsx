import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Camera,
  X,
  Trash2,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import ProfileAvatar from '../../components/ProfileAvatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

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
            'Unable to load your profile details.'
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

  // ---------------- Update profile details ----------------
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
      setSuccess('Profile details updated successfully.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Select photo ----------------
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoSuccess('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Only JPEG, PNG, or WebP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Photo must be smaller than 10MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ---------------- Cancel photo selection ----------------
  const cancelSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoError('');
    setPhotoSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------------- Upload photo ----------------
  const uploadPhoto = async () => {
    if (!selectedFile || photoSaving) return;

    setPhotoSaving(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const data = await userService.uploadMyProfilePhoto(selectedFile);
      const newUrl = data?.profilePhotoUrl || null;

      setPhotoUrl(newUrl);
      setProfilePhotoUrl(newUrl); // updates navbar and global avatar instantly
      cancelSelection();
      setPhotoSuccess('Profile photo uploaded and saved successfully.');
    } catch (err) {
      setPhotoError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to upload your profile photo.'
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  // ---------------- Remove photo ----------------
  const removePhoto = async () => {
    if (photoSaving) return;

    setPhotoSaving(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      await userService.removeMyProfilePhoto();
      setPhotoUrl(null);
      setProfilePhotoUrl(null);
      setPhotoSuccess('Profile photo removed.');
    } catch (err) {
      setPhotoError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to remove your photo.'
      );
    } finally {
      setPhotoSaving(false);
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs">
              <UserIcon size={22} strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                My Profile
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage your personal information and profile picture.
              </p>
            </div>
          </div>

          {role && <Badge variant={role} />}
        </div>
      </div>

      {/* ================= PHOTO SECTION ================= */}
      <Card glass className="mb-6 p-6 sm:p-7">
        {photoError && <AlertBox message={photoError} />}
        {photoSuccess && <SuccessBox message={photoSuccess} />}

        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <ProfileAvatar
            photoUrl={previewUrl || photoUrl}
            name={fullName || username}
            size="xl"
            className="ring-4 ring-slate-100"
          />

          <div className="flex flex-1 flex-col items-center sm:items-start gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Camera}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>

                {photoUrl && (
                  <Button
                    variant="dangerGhost"
                    size="sm"
                    icon={Trash2}
                    onClick={removePhoto}
                    loading={photoSaving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={uploadPhoto}
                  loading={photoSaving}
                >
                  {photoSaving ? 'Uploading...' : 'Save Photo'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={cancelSelection}
                  disabled={photoSaving}
                >
                  Cancel
                </Button>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Supported formats: JPEG, PNG, or WebP. Maximum file size: 10MB.
            </p>
          </div>
        </div>
      </Card>

      {/* ================= PROFILE DETAILS FORM ================= */}
      <Card glass className="p-6 sm:p-8">
        {error && <AlertBox message={error} />}
        {success && <SuccessBox message={success} />}

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            <p className="text-xs text-slate-400">Loading profile details...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {/* Username (Read only) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight">
                Username
              </label>

              <div className="flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 text-xs font-medium text-slate-600">
                <UserIcon size={16} className="mr-2 text-slate-400" />
                <span>{username}</span>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                Username is assigned by institutional administrators and cannot be altered.
              </p>
            </div>

            {/* Role (Read only) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight">
                Role & Authorization
              </label>

              <div className="flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 text-xs font-medium text-slate-600">
                <Shield size={16} className="mr-2 text-slate-400" />
                <span>{role}</span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-fullname"
                className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
              >
                Full Name
              </label>

              <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <UserIcon size={17} />
                </div>

                <input
                  id="profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="h-full w-full bg-transparent pr-3.5 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-xs font-semibold text-slate-700 tracking-tight"
              >
                Email Address
              </label>

              <div className="group relative flex h-11 w-full items-center rounded-xl border border-slate-200 bg-white transition-all duration-150 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <div className="flex pl-3.5 pr-2 items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={17} />
                </div>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter institutional email"
                  required
                  className="h-full w-full bg-transparent pr-3.5 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                Two-factor authentication and password recovery OTPs will be delivered to this email.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                iconRight={CheckCircle2}
                className="w-full"
              >
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </Button>
            </div>
          </form>
        )}
      </Card>
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