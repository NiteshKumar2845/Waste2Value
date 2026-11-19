import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (error) => error.response?.data?.message || error.message || 'Something went wrong';

// Retain the current lightweight overview's listing API while sharing the same API URL.
export async function getListings() {
  const { data } = await api.get('/listings');
  return data;
}

export async function createListing(payload) {
  const { data } = await api.post('/listings', payload);
  return data;
}

export default api;
