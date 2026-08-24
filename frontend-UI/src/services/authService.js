import api from './api';

const authService = {
  // Step 1:
  // Verify username + password and trigger email OTP.
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });

    return response.data;
  },

  // Step 2:
  // Verify OTP and receive the final JWT.
  verifyLoginOtp: async (username, otp) => {
    const response = await api.post('/api/auth/verify-otp', {
      username,
      otp,
    });

    return response.data;
  },

  // Resend OTP for an existing pending login.
  resendLoginOtp: async (username) => {
    const response = await api.post('/api/auth/resend-otp', {
      username,
    });

    return response.data;
  },

  /**
   * Starts the username-based forgot-password flow.
   * The backend resolves the user's email and sends the OTP.
   * The frontend does not ask the user for an email address.
   */
  requestPasswordReset: async (username) => {
    const response = await api.post(
      '/api/auth/forgot-password',
      { username }
    );

    return response.data;
  },

  verifyPasswordReset: async ({
    username,
    otp,
    newPassword,
    confirmPassword,
  }) => {
    const response = await api.post(
      '/api/auth/forgot-password/verify',
      {
        username,
        otp,
        newPassword,
        confirmPassword,
      }
    );

    return response.data;
  },

  resendPasswordResetOtp: async (username) => {
    const response = await api.post(
      '/api/auth/forgot-password/resend-otp',
      { username }
    );

    return response.data;
  },

  changePassword: async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    const response = await api.post(
      '/api/auth/change-password',
      {
        currentPassword,
        newPassword,
        confirmPassword,
      }
    );

    return response.data;
  },
};

export default authService;