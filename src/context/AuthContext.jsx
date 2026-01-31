import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('print_token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.data;
      
      // Ensure only print center users can access this dashboard
      if (userData.type !== 'PRINT_CENTER' && userData.type !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('print_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      const { token, user: userData } = response.data.data;
      
      if (userData.type !== 'PRINT_CENTER' && userData.type !== 'ADMIN') {
        return {
          success: false,
          error: 'Unauthorized access. This dashboard is for print centers only.',
        };
      }
      
      localStorage.setItem('print_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('print_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
