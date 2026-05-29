import axiosInstance from '../utils/axiosConfig';

export const authService = {
  async login(email, password) {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
