import axiosInstance from '../utils/axiosConfig';

export const authService = {
  async login(email, password) {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyOTP(email, otp) {
    const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(email, otp, password, confirmPassword) {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      otp,
      password,
      confirmPassword,
    });
    return response.data;
  },
};

