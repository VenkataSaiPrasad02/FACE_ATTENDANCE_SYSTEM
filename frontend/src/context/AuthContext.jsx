import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem('jwt')
  );

  const [role, setRole] = useState(() =>
    localStorage.getItem('role')
  );

  const [username, setUsername] = useState(() =>
    localStorage.getItem('username')
  );

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  // =========================================================
  // Load profile photo when logged in
  // =========================================================
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
      .catch(() => {
        // Navbar will simply show initials.
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================================================
  // STEP 1 — Username + Password
  // =========================================================
  const login = async (usernameInput, password) => {
    const data = await authService.login(
      usernameInput,
      password
    );

    /*
     * IMPORTANT:
     *
     * New login flow does NOT return JWT here.
     * It returns:
     *
     * {
     *   otpRequired: true,
     *   username: "...",
     *   maskedEmail: "...",
     *   message: "..."
     * }
     *
     * Therefore DON'T store token here unless
     * the backend actually returned one.
     */

    if (data?.token) {
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);

      setToken(data.token);
      setRole(data.role);
      setUsername(data.username);
    }

    return data;
  };

  // =========================================================
  // STEP 2 — Verify Login OTP
  // =========================================================
  const verifyLoginOtp = async (
    usernameInput,
    otp
  ) => {
    const data = await authService.verifyLoginOtp(
      usernameInput,
      otp
    );

    /*
     * Backend returns JWT only after successful OTP.
     */

    localStorage.setItem('jwt', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);

    setToken(data.token);
    setRole(data.role);
    setUsername(data.username);

    return data;
  };

  // =========================================================
  // RESEND LOGIN OTP
  // =========================================================
  const resendLoginOtp = async (usernameInput) => {
    return await authService.resendLoginOtp(
      usernameInput
    );
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setToken(null);
    setRole(null);
    setUsername(null);
    setProfilePhotoUrl(null);
  };

  // =========================================================
  // PROVIDER
  // =========================================================
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