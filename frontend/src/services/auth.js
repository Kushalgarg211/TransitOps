import apiClient, { handleApiWithFallback } from './api';

export const loginUser = async (email, password) => {
  return handleApiWithFallback(
    () => apiClient.post('/auth/login', { email, password }),
    () => {
      throw new Error('Authentication failed');
    }
  );
};
