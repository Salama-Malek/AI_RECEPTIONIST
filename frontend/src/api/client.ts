import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API error', error?.response?.data || error.message);
    return Promise.reject(error);
  },
);
