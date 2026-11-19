import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

function saveSession(data) {
  const token = data.token || data.accessToken;
  const user = data.user || data;

  if (!token || !user || typeof user !== 'object') {
    throw new Error('The server returned an invalid authentication response');
  }

  localStorage.setItem('w2v_token', token);
  localStorage.setItem('w2v_user', JSON.stringify(user));
  return user;
}

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('w2v_user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  const value = useMemo(() => ({
    user,
    login: async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(saveSession(data));
    },
    register: async (details) => {
      const { data } = await api.post('/auth/register', details);
      setUser(saveSession(data));
    },
    logout: () => {
      localStorage.removeItem('w2v_token');
      localStorage.removeItem('w2v_user');
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
