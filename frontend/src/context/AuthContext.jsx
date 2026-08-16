import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // authService returns res.data (the Axios layer stripped)
          // Backend envelope: { success, message, data: <payload> }
          const res = await authService.getMe();
          const meData = res.data; // unwrap the envelope's data field
          setUser(meData);
          localStorage.setItem('user', JSON.stringify(meData));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    // authService returns res.data = { success, message, data: { token, user } }
    // so we need .data to get the actual payload
    try {
      const res = await authService.login(credentials);
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      return res;
    } catch (err) {
      // Backend error envelope uses 'message' field
      const msg = err?.response?.data?.message || err?.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const registerOwner = async (ownerData) => {
    try {
      const res = await authService.registerOwner(ownerData);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      const res = await authService.registerAdmin(adminData);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, []);

  const updateProfile = async (profileData) => {
    const res = await userService.updateProfile(profileData);
    const updatedUser = res.data; // unwrap backend envelope { success, message, data: <user> }
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    loading,
    login,
    register,
    registerOwner,
    registerAdmin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

