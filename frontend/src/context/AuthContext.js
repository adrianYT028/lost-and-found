import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      // Use stored snapshot immediately (fast UI) while we verify token in background
      try {
        const snap = localStorage.getItem('user');
        if (snap) {
          const parsed = JSON.parse(snap);
          if (parsed && (parsed.id || parsed.email || parsed.firstName || parsed.name)) {
            setUser(parsed);
          }
        }
      } catch (err) {
        // ignore parse errors
      }

      if (token) {
        try {
          // Refresh authoritative profile from backend
          const response = await apiService.users.getProfile();
          const data = response && (response.data || response);

          if (data && (data.id || data.email || data.name || data.firstName)) {
            setUser(data);
            try { localStorage.setItem('user', JSON.stringify(data)); } catch (err) { /* ignore */ }
          } else {
            // token invalid or response unexpected
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error("Failed to load user from token", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext login called with:', userData);
    localStorage.setItem('token', token);
    // Also store user data in localStorage for persistence across sessions
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Make sure to remove user from storage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
