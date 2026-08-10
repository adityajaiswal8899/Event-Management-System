import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [fetchProfile]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = async (updateData) => {
    const updated = await authService.updateProfile(updateData);
    setUser(updated);
    return updated;
  };

  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser || user?.is_staff;
  const isOrganizer = user?.role === 'ORGANIZER' || isAdmin;
  const isAttendee = user?.role === 'ATTENDEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshProfile: fetchProfile,
        isAuthenticated: !!user,
        isAdmin,
        isOrganizer,
        isAttendee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
