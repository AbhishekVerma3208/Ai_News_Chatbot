import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await apiService.auth.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Apply saved theme
        if (userData?.preferences?.theme) {
          document.body.setAttribute('data-theme', userData.preferences.theme);
          localStorage.setItem('theme', userData.preferences.theme);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Apply user theme
      if (response.user?.preferences?.theme) {
        document.body.setAttribute('data-theme', response.user.preferences.theme);
        localStorage.setItem('theme', response.user.preferences.theme);
      }
      
      toast.success(`Welcome back, ${response.user.fullName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.error || error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`Welcome, ${response.user.fullName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.error || error.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};