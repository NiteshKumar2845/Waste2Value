import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('w2v_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const requestUrl = error.config?.url || '';
  if (error.response?.status === 401 && !/\/auth\/(login|register)$/.test(requestUrl)) {
    localStorage.removeItem('token');
    localStorage.removeItem('w2v_token');
    localStorage.removeItem('w2v_user');
    window.dispatchEvent(new Event('waste2value:session-expired'));
  }
  return Promise.reject(error);
});

export const errMsg = (error) => error.response?.data?.message || error.message || 'Something went wrong';

export async function getListings() {
  const { data } = await api.get('/listings/mine');
  return data;
}

export async function createListing(payload) {
  const { data } = await api.post('/listings', payload);
  return data;
}

export default api;
