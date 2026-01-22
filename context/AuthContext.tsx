import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { User, LoginRequest, RegisterRequest } from '@/types/api.types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { setUserData, getUserData, removeUserData } from '@/utils/storage';

/**
 * Auth Context State Interface
 */
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check if user is authenticated on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!user && !inAuthScreen) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && inAuthScreen) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  /**
   * Initialize authentication state
   * Check if user has valid cookie by fetching user data
   */
  const initializeAuth = async () => {
    try {
      // Try to get cached user data first for instant UI
      const cachedUser = await getUserData<User>();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Try to fetch user data from API (cookie will be sent automatically)
      // If cookie is valid, this will succeed
      await refreshUser();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid cached user data
      await removeUserData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Fetch user data after login
      const userData = await userService.getCurrentUser();
      
      setUser(userData);
      await setUserData(userData);
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      // Fetch user data after registration
      const userDataResponse = await userService.getCurrentUser();
      
      setUser(userDataResponse);
      await setUserData(userDataResponse);
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      // Call logout endpoint to clear cookie on server
      await authService.logout();
      // Clear cached user data
      await removeUserData();
      setUser(null);
      
      // Navigation will be handled by useEffect
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      await removeUserData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      await setUserData(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Export context for advanced usage
 */
export { AuthContext };
