import React, {
  createContext,
  useState,
  useEffect,
} from 'react';

import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext(null);


/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;

  // Backend returned a plain string
  if (
    typeof responseData === 'string' &&
    responseData.trim()
  ) {
    return responseData;
  }

  // Backend returned JSON
  if (responseData && typeof responseData === 'object') {
    return (
      responseData.message ||
      responseData.error ||
      responseData.detail ||
      responseData.errors?.message ||
      fallback
    );
  }

  // Axios/network error
  return (
    error?.message ||
    fallback
  );
}


/* =========================================================
   NORMALIZE ERROR
========================================================= */

function normalizeAuthError(error, fallback) {
  const message = getErrorMessage(
    error,
    fallback
  );

  const normalizedError = new Error(message);

  // Preserve useful Axios information
  normalizedError.status =
    error?.response?.status ||
    error?.status ||
    null;

  normalizedError.response =
    error?.response;

  normalizedError.data =
    error?.response?.data;

  normalizedError.code =
    error?.code;

  return normalizedError;
}


export function AuthProvider({ children }) {

  // =======================================================
  // AUTH STATE
  // =======================================================

  const [token, setToken] = useState(() =>
    localStorage.getItem('jwt')
  );

  const [role, setRole] = useState(() =>
    localStorage.getItem('role')
  );

  const [username, setUsername] = useState(() =>
    localStorage.getItem('username')
  );

  const [profilePhotoUrl, setProfilePhotoUrl] =
    useState(null);


  // =======================================================
  // LOAD PROFILE PHOTO
  // =======================================================

  useEffect(() => {

    if (!token) {
      setProfilePhotoUrl(null);
      return;
    }

    let cancelled = false;

    userService
      .getMyProfile()
      .then((data) => {

        if (!cancelled) {
          setProfilePhotoUrl(
            data?.profilePhotoUrl || null
          );
        }

      })
      .catch((error) => {

        // Profile photo failure should NOT
        // logout the user or break authentication.

        console.warn(
          'Unable to load profile photo:',
          error
        );

        if (!cancelled) {
          setProfilePhotoUrl(null);
        }

      });

    return () => {
      cancelled = true;
    };

  }, [token]);


  // =======================================================
  // STEP 1 — USERNAME + PASSWORD
  // =======================================================

  const login = async (
    usernameInput,
    password
  ) => {

    try {

      if (!usernameInput?.trim()) {
        throw new Error(
          'Username is required.'
        );
      }

      if (!password) {
        throw new Error(
          'Password is required.'
        );
      }

      const data =
        await authService.login(
          usernameInput.trim(),
          password
        );


      // ===================================================
      // BACKEND MAY RETURN AN ERROR OBJECT
      // ===================================================

      if (
        data?.success === false ||
        data?.status === 401 ||
        data?.status === 403
      ) {

        throw new Error(
          data?.message ||
          data?.error ||
          'Wrong username or password.'
        );

      }


      // ===================================================
      // OTP REQUIRED
      // ===================================================

      if (data?.otpRequired) {

        return data;

      }


      // ===================================================
      // DIRECT JWT LOGIN
      // ===================================================

      if (data?.token) {

        localStorage.setItem(
          'jwt',
          data.token
        );

        localStorage.setItem(
          'role',
          data.role || ''
        );

        localStorage.setItem(
          'username',
          data.username ||
            usernameInput.trim()
        );

        setToken(data.token);

        setRole(data.role || null);

        setUsername(
          data.username ||
          usernameInput.trim()
        );

        return data;

      }


      // ===================================================
      // UNEXPECTED RESPONSE
      // ===================================================

      if (!data) {
        throw new Error(
          'No response received from the authentication server.'
        );
      }

      return data;

    } catch (error) {

      console.error(
        'Authentication login failed:',
        error
      );

      throw normalizeAuthError(
        error,
        'Wrong username or password.'
      );

    }

  };


  // =======================================================
  // STEP 2 — VERIFY LOGIN OTP
  // =======================================================

  const verifyLoginOtp = async (
    usernameInput,
    otp
  ) => {

    try {

      if (!usernameInput?.trim()) {
        throw new Error(
          'Username is required.'
        );
      }

      if (!otp?.trim()) {
        throw new Error(
          'OTP is required.'
        );
      }

      const data =
        await authService.verifyLoginOtp(
          usernameInput.trim(),
          otp.trim()
        );


      // ===================================================
      // VALIDATE TOKEN
      // ===================================================

      if (!data?.token) {

        throw new Error(
          data?.message ||
          data?.error ||
          'OTP verification failed.'
        );

      }


      // ===================================================
      // SAVE AUTH DATA
      // ===================================================

      localStorage.setItem(
        'jwt',
        data.token
      );

      localStorage.setItem(
        'role',
        data.role || ''
      );

      localStorage.setItem(
        'username',
        data.username ||
          usernameInput.trim()
      );


      setToken(data.token);

      setRole(
        data.role || null
      );

      setUsername(
        data.username ||
        usernameInput.trim()
      );


      return data;

    } catch (error) {

      console.error(
        'Login OTP verification failed:',
        error
      );

      throw normalizeAuthError(
        error,
        'Invalid or expired OTP.'
      );

    }

  };


  // =======================================================
  // RESEND LOGIN OTP
  // =======================================================

  const resendLoginOtp = async (
    usernameInput
  ) => {

    try {

      if (!usernameInput?.trim()) {
        throw new Error(
          'Username is required.'
        );
      }

      const data =
        await authService.resendLoginOtp(
          usernameInput.trim()
        );


      if (
        data?.success === false ||
        data?.status >= 400
      ) {

        throw new Error(
          data?.message ||
          data?.error ||
          'Unable to resend OTP.'
        );

      }

      return data;

    } catch (error) {

      console.error(
        'Resend login OTP failed:',
        error
      );

      throw normalizeAuthError(
        error,
        'Unable to resend OTP.'
      );

    }

  };


  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {

    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setToken(null);
    setRole(null);
    setUsername(null);
    setProfilePhotoUrl(null);

  };


  // =======================================================
  // PROVIDER
  // =======================================================

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        username,

        profilePhotoUrl,
        setProfilePhotoUrl,

        login,
        verifyLoginOtp,
        resendLoginOtp,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}