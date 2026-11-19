import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('w2v_user') || 'null');
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('w2v_token');
  localStorage.removeItem('w2v_user');
}

function saveSession(responseData) {
  const token = responseData?.token || responseData?.accessToken;
  const user = responseData?.user;
  if (!token || !user || typeof user !== 'object') {
    throw new Error('The server returned an invalid authentication response.');
  }

  // Keep both names readable while existing sessions migrate to the shared token key.
  localStorage.setItem('token', token);
  localStorage.setItem('w2v_token', token);
  localStorage.setItem('w2v_user', JSON.stringify(user));
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const handleExpiredSession = () => {
      clearSession();
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('waste2value:session-expired', handleExpiredSession);

    const token = localStorage.getItem('token') || localStorage.getItem('w2v_token');
    if (!token) {
      clearSession();
      setUser(null);
      setLoading(false);
      return () => window.removeEventListener('waste2value:session-expired', handleExpiredSession);
    }

    if (!localStorage.getItem('token')) localStorage.setItem('token', token);
    api.get('/auth/me')
      .then(({ data }) => {
        if (active) {
          setUser(data.user);
          localStorage.setItem('w2v_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => {
      active = false;
      window.removeEventListener('waste2value:session-expired', handleExpiredSession);
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login: async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      const signedInUser = saveSession(data);
      setUser(signedInUser);
      return signedInUser;
    },
    register: async (details) => {
      const { data } = await api.post('/auth/register', details);
      const registeredUser = saveSession(data);
      setUser(registeredUser);
      return registeredUser;
    },
    logout: () => {
      clearSession();
      setUser(null);
    },
    refreshUser: async () => {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('w2v_user', JSON.stringify(data.user));
      return data.user;
    },
    setUser,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
