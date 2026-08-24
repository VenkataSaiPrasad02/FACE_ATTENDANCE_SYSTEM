/*
 * Converts backend error payloads into friendly, user-safe messages.
 * Stack traces / raw technical text are never surfaced to users.
 */

const FRIENDLY_MESSAGES = {
  NO_ACTIVE_SESSION:
    'Attendance is not currently open. Please wait until your teacher opens attendance.',
  SESSION_NOT_OPEN: 'Attendance is not currently open.',
  SESSION_EXPIRED: 'This attendance session has expired.',
  SESSION_CLOSED: 'This attendance session has been closed.',
  SESSION_CONFLICT:
    'Attendance is already open for this batch. Close the active session first.',
  NOT_ELIGIBLE_FOR_SESSION:
    'You are not eligible for this attendance session.',
  OUTSIDE_ATTENDANCE_AREA:
    'You are outside the attendance area (50 m). Please move closer and try again.',
  FACE_MISMATCH:
    'The detected face does not match your account. Attendance was not marked.',
  FACE_NOT_RECOGNIZED:
    'Face not recognized. Please retake the photo in good lighting, facing the camera.',
  LOW_CONFIDENCE:
    'The face was not clear enough. Please retake the photo in better lighting.',
  DUPLICATE_ATTENDANCE: null, // backend message already user-friendly
  INVALID_STATE: null,
  VALIDATION_ERROR: null, // field errors handled separately
  INVALID_OTP: null,
  OTP_EXPIRED: null,
  USER_BLOCKED: null,
  PASSWORD_MISMATCH: null,
  INVALID_CREDENTIALS: 'Invalid username or password.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Contact your admin.',
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  PASSWORD_CHANGE_REQUIRED:
    'Please set your new password before using the system.',
  FACE_SERVICE_UNAVAILABLE:
    'Face recognition is temporarily unavailable. Please try again shortly.',
  INTERNAL_ERROR: 'Something went wrong on our side. Please try again.',
};

/**
 * Extracts the best human-readable message from an axios error.
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;

  if (!data) {
    if (error?.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }
    return fallback;
  }

  const code = data.code;
  if (code && Object.prototype.hasOwnProperty.call(FRIENDLY_MESSAGES, code)) {
    return FRIENDLY_MESSAGES[code] ?? data.message ?? fallback;
  }

  // Backend messages are written user-facing; prefer them when present.
  return (
    data.message ||
    data.detail ||
    (typeof data === 'string' ? data : '') ||
    fallback
  );
}

export default getErrorMessage;
