import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (name: string, email: string, pass: string) => Promise<UserProfile>;
  adminLogin: (email: string, pass: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleSignIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.signIn(email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.signUp(name, email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.adminLogin(email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const role = user ? user.role : null;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        adminLogin: handleAdminLogin,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
