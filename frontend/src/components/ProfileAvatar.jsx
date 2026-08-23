import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../services/api';

/**
 * Displays a user's profile photo, falling back to an initials
 * badge when no photo exists or the image fails to load.
 *
 * photoUrl: relative path from the backend (e.g. "/uploads/profiles/x.jpg") or null
 * name: full name or username — first letter is used for the fallback
 * size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * shape: 'full' (circle) | 'lg' (rounded square)
 */
export default function ProfileAvatar({
  photoUrl,
  name,
  size = 'md',
  shape = 'full',
  className = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [photoUrl]);

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-14 w-14 text-lg font-bold',
    xl: 'h-24 w-24 text-3xl font-bold',
  }[size] || 'h-10 w-10 text-sm font-semibold';

  const shapeClass = shape === 'lg' ? 'rounded-2xl' : 'rounded-full';
  const initial = (name || '?').charAt(0).toUpperCase();

  const showImage = photoUrl && !imgFailed;
  const absoluteUrl = showImage
    ? (photoUrl.startsWith('http') ? photoUrl : `${API_ORIGIN}${photoUrl}`)
    : null;

  if (showImage) {
    return (
      <img
        src={absoluteUrl}
        alt={name || 'Profile'}
        onError={() => setImgFailed(true)}
        className={`
          ${sizeClasses} ${shapeClass} shrink-0 object-cover
          border border-white/15 shadow-glow-sm
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses} ${shapeClass} flex shrink-0 items-center justify-center
        bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 font-bold text-white
        border border-cyan-200/30 shadow-glow-sm tracking-tight
        ${className}
      `}
    >
      {initial}
    </div>
  );
}