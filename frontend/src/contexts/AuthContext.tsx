import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

interface AuthContextProps {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userType, setUserType] = useState<string | null>(localStorage.getItem('user_type'));
  const navigate = useNavigate();

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/api/login', { username, password });
    const jwt = data.access_token as string;
    setToken(jwt);
    localStorage.setItem('token', jwt);

    // decode JWT to fetch user_type (simple base64 decode, no signature validation)
    const [, payloadBase64] = jwt.split('.');
    try {
      const payloadStr = atob(payloadBase64);
      const payload = JSON.parse(payloadStr);
      setUserType(payload.user_type);
      localStorage.setItem('user_type', payload.user_type);
    } catch (e) {
      console.error('Unable to parse token payload');
    }
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_type');
    navigate('/login');
  }, [navigate]);

  const isAdmin = userType === 'admin';

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}; 