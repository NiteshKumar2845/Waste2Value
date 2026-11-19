import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const requestUrl = error.config?.url || '';
  if (error.response?.status === 401 && localStorage.getItem('token') && !/\/auth\/(login|register)$/.test(requestUrl)) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('waste2value:session-expired'));
  }
  return Promise.reject(error);
});

export const errMsg = (error) => error.response?.data?.message || error.message || 'Something went wrong';

// Retain the current lightweight overview's listing API while sharing the same API URL.
export async function getListings() {
  const { data } = await api.get('/listings/mine');
  return data;
}

export async function createListing(payload) {
  const { data } = await api.post('/listings', payload);
  return data;
}

export default api;
