import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fallback helper to execute mock logic when API fails/is missing
export const handleApiWithFallback = async (apiCall, fallbackLogic) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    // If it's a network error (no response) or a 404 (endpoint not implemented), fall back to local storage
    if (!error.response || error.response.status === 404 || error.response.status === 500) {
      console.warn('API endpoint unavailable or failed. Using local storage simulated database.', error.message);
      // Add a slight simulation delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return fallbackLogic();
    }
    toast.error(error.response?.data?.message || 'An error occurred during the request.');
    throw error;
  }
};

export default apiClient;
