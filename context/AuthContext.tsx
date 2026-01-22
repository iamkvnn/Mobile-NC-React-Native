import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { User, LoginRequest, RegisterRequest } from '@/types/api.types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

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
   * Cookie will be sent automatically - if valid, user data is fetched
   */
  const initializeAuth = async () => {
    try {
      // Fetch user data from API (cookie is sent automatically)
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // No valid cookie or user not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   * Cookie is set by server automatically
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      await authService.login(credentials);
      
      // Fetch user data (cookie is now set)
      const userData = await userService.getCurrentUser();
      setUser(userData);
      
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
   * Cookie is set by server automatically
   */
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      
      // Fetch user data (cookie is now set)
      const userDataResponse = await userService.getCurrentUser();
      setUser(userDataResponse);
      
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
   * Server clears the cookie
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      // Call logout endpoint to clear cookie on server
      await authService.logout();
      setUser(null);
      
      // Navigation will be handled by useEffect
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
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
