import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (value) => {
  if (!value) return null;
  return {
    ...value,
    _id: value._id || value.id,
    id: value.id || value._id
  };
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (nextUser) => {
    setUserState(normalizeUser(nextUser));
  };

  useEffect(() => {
    const token = localStorage.getItem('friendzone_token');
    if (token) {
      api.auth.me()
        .then(data => {
          const normalizedUser = normalizeUser(data);
          if (normalizedUser?._id) {
            setUserState(normalizedUser);
          } else {
            localStorage.removeItem('friendzone_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('friendzone_token');
          setUserState(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    const onAuthExpired = () => {
      setUserState(null);
    };

    window.addEventListener('friendzone-auth-expired', onAuthExpired);
    return () => {
      window.removeEventListener('friendzone-auth-expired', onAuthExpired);
    };
  }, []);

  const login = async (username, password) => {
    const data = await api.auth.login(username, password);
    if (data.token) {
      localStorage.setItem('friendzone_token', data.token);
      setUserState(normalizeUser(data.user));
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    localStorage.removeItem('friendzone_token');
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
