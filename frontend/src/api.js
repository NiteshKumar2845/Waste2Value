import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('w2v_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (error) => {
  const response = error?.response;
  const data = response?.data;
  const message = data?.message || data?.error || data?.errors;

  if (data?.code === 11000 || error?.code === 11000 || /duplicate key|already exists/i.test(String(message || ''))) {
    return 'An account with this email already exists. Try logging in or use a different email address.';
  }
  if (Array.isArray(message)) return message.map((item) => item.message || item.msg || String(item)).join(' ');
  if (message && typeof message === 'object') return Object.values(message).map((item) => item.message || String(item)).join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  if (response?.status === 401 || response?.status === 403) return 'Your session could not be authenticated. Please check your details and try again.';
  if (response?.status >= 500) return 'The server is having trouble right now. Please try again shortly.';
  if (response) return 'The request could not be completed. Please review your details and try again.';
  if (error?.request) return 'No response was received from the server. Check your connection and try again.';
  if (error?.code === 'ERR_NETWORK') return 'Unable to reach the server. Check your connection and try again.';
  return error?.message || 'Something went wrong. Please try again.';
};

export default api;
