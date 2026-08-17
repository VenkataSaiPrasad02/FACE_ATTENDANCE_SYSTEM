import { useState, useEffect } from 'react';
import { API_ORIGIN } from '../services/api';

/**
 * Displays a user's profile photo, falling back to an initials
 * badge when no photo exists or the image fails to load.
 *
 * photoUrl: relative path from the backend (e.g. "/uploads/profiles/x.jpg") or null
 * name: full name or username — first letter is used for the fallback
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * shape: 'full' (circle, used in lists) | 'lg' (rounded square, used in Navbar)
 */
export default function ProfileAvatar({ photoUrl, name, size = 'md', shape = 'full' }) {
  // Reset the "broken image" state whenever the photo URL itself changes
  // (e.g. after a new upload) — otherwise a previously-broken image
  // would stay stuck showing initials even after a valid photo arrives.
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [photoUrl]);

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-28 w-28 text-4xl',
  }[size];

  const shapeClass = shape === 'lg' ? 'rounded-lg' : 'rounded-full';
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
        className={`${sizeClasses} ${shapeClass} shrink-0 object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${shapeClass} flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-sm`}
    >
      {initial}
    </div>
  );
}