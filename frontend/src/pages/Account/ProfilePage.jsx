import React, { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
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

  // ---------------- Crop state ----------------
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError(
        'Only JPEG, PNG, or WebP images are allowed.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Photo must be smaller than 10MB.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCropImageUrl(imageUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);
  };

  // ---------------- Crop complete ----------------
  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  // ---------------- Create cropped image ----------------
  const createCroppedImage = async () => {
    if (!cropImageUrl || !croppedAreaPixels) {
      return;
    }

    try {
      const image = new Image();

      image.src = cropImageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');

      const outputSize = 600;

      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to create image canvas.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputSize,
        outputSize
      );

      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          'image/jpeg',
          0.92
        );
      });

      if (!blob) {
        throw new Error('Unable to create cropped image.');
      }

      const croppedFile = new File(
        [blob],
        'profile-photo.jpg',
        {
          type: 'image/jpeg',
          lastModified: Date.now(),
        }
      );

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(blob);

      setSelectedFile(croppedFile);
      setPreviewUrl(newPreviewUrl);

      URL.revokeObjectURL(cropImageUrl);

      setCropImageUrl(null);
      setCropOpen(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (err) {
      console.error('Crop failed:', err);

      setPhotoError(
        'Unable to crop the selected image. Please try another image.'
      );
    }
  };

  // ---------------- Cancel crop ----------------
  const cancelCrop = () => {
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }

    setCropImageUrl(null);
    setCropOpen(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ---------------- Cancel photo selection ----------------
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
    if (!selectedFile || photoSaving) return;

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

      setPhotoUrl(newUrl);

      // Updates navbar and global avatar instantly
      setProfilePhotoUrl(newUrl);

      cancelSelection();

      setPhotoSuccess(
        'Profile photo uploaded and saved successfully.'
      );
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
      {/* =====================================================
          PAGE HEADER / HERO IDENTITY CARD
      ====================================================== */}
      <div className="mb-6">
        <Link
          to="/"
          className="
            mb-3 inline-flex items-center gap-1.5
            text-xs font-semibold
            text-slate-500
            transition-colors
            hover:text-white
          "
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <Card glass className="relative overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-60" />

          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 rounded-full p-0.5 shadow-glow bg-gradient-to-br from-blue-500 to-cyan-400">
                <ProfileAvatar
                  photoUrl={previewUrl || photoUrl}
                  name={fullName || username}
                  size="xl"
                />
              </div>

              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  My Profile
                </h1>

                {username && (
                  <p className="font-display mt-0.5 font-mono text-sm font-semibold text-cyan-300">
                    @{username}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-400">
                  Manage your personal information and profile picture.
                </p>
              </div>
            </div>

            {role && <Badge variant={role} />}
          </div>
        </Card>
      </div>

      {/* =====================================================
          PHOTO SECTION
      ====================================================== */}
      <Card glass className="mb-6 p-6 sm:p-7">
        {photoError && <AlertBox message={photoError} />}

        {photoSuccess && (
          <SuccessBox message={photoSuccess} />
        )}

        <div
          className="
            flex flex-col gap-5 rounded-2xl
            border border-dashed border-white/15
            bg-white/[0.02]
            px-5 py-5
            transition-all duration-200
            hover:border-cyan-300/40
            sm:flex-row
          "
        >
          <ProfileAvatar
            photoUrl={previewUrl || photoUrl}
            name={fullName || username}
            size="lg"
            className="ring-4 ring-white/10"
          />

          <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:items-start">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Camera}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
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
                  {photoSaving
                    ? 'Uploading...'
                    : 'Save Photo'}
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

            <p className="text-[11px] text-slate-500">
              Select your image and crop the required portion.
              Supported formats: JPEG, PNG, or WebP. Maximum
              file size: 10MB.
            </p>
          </div>
        </div>
      </Card>

      {/* =====================================================
          PROFILE DETAILS FORM
      ====================================================== */}
      <Card glass className="p-6 sm:p-8">
        {error && <AlertBox message={error} />}

        {success && <SuccessBox message={success} />}

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <span
              className="
                h-7 w-7
                animate-spin
                rounded-full
                border-2
                border-white/10
                border-t-cyan-400
              "
            />

            <p className="text-xs text-slate-500">
              Loading profile details...
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4"
          >
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-tight text-slate-300">
                Username
              </label>

              <div
                className="
                  flex h-11 w-full
                  items-center
                  rounded-xl
                  border border-white/[0.08]
                  bg-white/[0.04]
                  px-3.5
                  text-xs font-medium
                  text-slate-300
                "
              >
                <UserIcon
                  size={16}
                  className="mr-2 text-slate-500"
                />

                <span>{username}</span>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Username is assigned by institutional administrators
                and cannot be altered.
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-tight text-slate-300">
                Role & Authorization
              </label>

              <div
                className="
                  flex h-11 w-full
                  items-center
                  rounded-xl
                  border border-white/[0.08]
                  bg-white/[0.04]
                  px-3.5
                  text-xs font-medium
                  text-slate-300
                "
              >
                <Shield
                  size={16}
                  className="mr-2 text-slate-500"
                />

                <span>{role}</span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-fullname"
                className="
                  mb-1.5 block
                  text-xs font-semibold
                  tracking-tight
                  text-slate-300
                "
              >
                Full Name
              </label>

              <div
                className="
                  group relative
                  flex h-11 w-full
                  items-center
                  rounded-xl
                  border border-white/10
                  bg-[#0a1026]/80
                  transition-all
                  duration-150
                  focus-within:border-cyan-300/60
                  focus-within:ring-4
                  focus-within:ring-cyan-400/10
                "
              >
                <div
                  className="
                    flex items-center justify-center
                    pl-3.5 pr-2
                    text-slate-500
                    transition-colors
                    group-focus-within:text-cyan-300
                  "
                >
                  <UserIcon size={17} />
                </div>

                <input
                  id="profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter full name"
                  required
                  className="
                    h-full w-full
                    bg-transparent
                    pr-3.5
                    text-xs font-medium
                    text-slate-100
                    outline-none
                    placeholder:text-slate-600
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="profile-email"
                className="
                  mb-1.5 block
                  text-xs font-semibold
                  tracking-tight
                  text-slate-300
                "
              >
                Email Address
              </label>

              <div
                className="
                  group relative
                  flex h-11 w-full
                  items-center
                  rounded-xl
                  border border-white/10
                  bg-[#0a1026]/80
                  transition-all
                  duration-150
                  focus-within:border-cyan-300/60
                  focus-within:ring-4
                  focus-within:ring-cyan-400/10
                "
              >
                <div
                  className="
                    flex items-center justify-center
                    pl-3.5 pr-2
                    text-slate-500
                    transition-colors
                    group-focus-within:text-cyan-300
                  "
                >
                  <Mail size={17} />
                </div>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter institutional email"
                  required
                  className="
                    h-full w-full
                    bg-transparent
                    pr-3.5
                    text-xs font-medium
                    text-slate-100
                    outline-none
                    placeholder:text-slate-600
                  "
                />
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Two-factor authentication and password recovery OTPs
                will be delivered to this email.
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
                {saving
                  ? 'Saving changes...'
                  : 'Save Profile Details'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* =====================================================
          CIRCULAR CROP MODAL
      ====================================================== */}
      {cropOpen && cropImageUrl && (
        <div
          className="
            fixed inset-0 z-[100]
            animate-fade-in
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-md
          "
        >
          <div
            className="
              relative
              w-full max-w-xl
              animate-scale-in
              overflow-hidden
              rounded-3xl
              border border-white/10
              bg-[#0b1128]
              shadow-card
            "
          >
            {/* Crop header */}
            <div
              className="
                flex items-center justify-between
                border-b border-white/[0.08]
                bg-gradient-to-r
                from-blue-600
                via-cyan-600
                to-violet-600
                px-5 py-4
              "
            >
              <div>
                <h2 className="font-display text-sm font-bold text-white">
                  Adjust Profile Photo
                </h2>

                <p className="mt-0.5 text-[11px] text-white/70">
                  Drag and zoom to select the required portion
                </p>
              </div>

              <button
                type="button"
                onClick={cancelCrop}
                aria-label="Close cropper"
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-white/10
                  text-white
                  transition
                  hover:bg-white/20
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Crop area */}
            <div
              className="
                relative
                h-[350px]
                w-full
                bg-[#050816]
                sm:h-[440px]
              "
            >
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>

            {/* Controls */}
            <div className="space-y-4 bg-[#0b1128] p-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Zoom
                  </span>

                  <span className="text-[11px] font-bold text-cyan-300">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) =>
                    setZoom(Number(event.target.value))
                  }
                  className="
                    h-1.5
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-white/10
                    accent-cyan-400
                  "
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelCrop}
                  className="
                    flex h-11 flex-1
                    items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/[0.06]
                    text-sm font-semibold
                    text-slate-200
                    transition
                    hover:bg-white/[0.11]
                    hover:text-white
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createCroppedImage}
                  disabled={!croppedAreaPixels}
                  className="
                    flex h-11 flex-1
                    items-center justify-center
                    gap-2
                    rounded-xl
                    border border-cyan-300/30
                    bg-gradient-to-r
                    from-blue-500
                    to-cyan-400
                    text-sm font-bold
                    text-white
                    shadow-glow-sm
                    transition
                    hover:shadow-glow
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <CheckCircle2 size={17} />
                  Apply Crop
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-500">
                Drag the image so your face is centered inside the circle.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ALERT
============================================================ */

function AlertBox({ message }) {
  return (
    <div
      className="
        mb-4 flex animate-fade-in items-start gap-2.5
        rounded-xl
        border border-rose-300/25
        bg-rose-500/10
        p-3
        text-rose-300
        shadow-card
      "
    >
      <AlertCircle
        size={16}
        className="mt-0.5 shrink-0 text-rose-400"
      />

      <p className="text-xs font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   SUCCESS
============================================================ */

function SuccessBox({ message }) {
  return (
    <div
      className="
        mb-4 flex animate-fade-in items-start gap-2.5
        rounded-xl
        border border-emerald-300/25
        bg-emerald-400/10
        p-3
        text-emerald-300
        shadow-card
      "
    >
      <CheckCircle2
        size={16}
        className="mt-0.5 shrink-0 text-emerald-400"
      />

      <p className="text-xs font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
}
