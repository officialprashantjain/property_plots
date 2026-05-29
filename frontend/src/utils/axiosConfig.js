import axios from 'axios';

// Create standard instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.29.54:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject token
axiosInstance.interceptors.request.use(
  (config) => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error is 401 Unauthorized AND the request wasn't the login endpoint
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !error.config.url.includes('/auth/login')) {
        console.warn('401 Unauthorized detected globally - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
