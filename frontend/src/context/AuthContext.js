import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Get user profile from backend
          const response = await apiService.users.getProfile();
          // apiService may return { success: true, data: { ... } } or the raw user object.
          const data = response && (response.data || response);

          // Only set user if data looks valid (has id, email or name)
          if (data && (data.id || data.email || data.name || data.firstName)) {
            setUser(data);
            // persist a lightweight user snapshot for quicker reloads
            try { localStorage.setItem('user', JSON.stringify(data)); } catch (err) { /* ignore */ }
          } else {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error("Failed to load user from token", error);
          // If token is invalid, remove it
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
