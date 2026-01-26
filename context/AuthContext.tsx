import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { User, LoginRequest, RegisterRequest } from '@/types/api.types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { getToken, setToken, setRefreshToken, clearAuthData } from '@/utils/storage';

/**
 * Auth Context State Interface
 */
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tempEmail: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  sendOtp: () => Promise<void>;
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
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Check if user is authenticated on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    //const inAuthGroup = segments[0] === '(auth)'; // If you have auth group
    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'verify-otp' || segments[0] === 'forgot-password' || segments[0] === 'reset-password';

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
   */
  const initializeAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Fetch user data from API
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      // No valid token or user not authenticated
      await clearAuthData();
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
      const authData = await authService.login(credentials);
      
      await setToken(authData.token.accessToken);
      await setRefreshToken(authData.token.refreshToken);
      setUser(authData.user);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error?.message === 'User email is not verified') {
          setTempEmail(credentials.email);
          router.push('/verify-otp'); // Assuming you have this route
          return;
      }
      
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
      await authService.register(userData);
      
      // After register, we usually expect OTP verification
      setTempEmail(userData.email);
      router.push('/verify-otp');
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const verifyOtp = async (otp: string) => {
      if (!tempEmail) throw new Error('No email found for verification');
      try {
          setIsLoading(true);
          // Just call the API to verify. Do not auto-login.
          await authService.verifyOtp({ email: tempEmail, otp });
          
          setTempEmail(null);
      } catch (error: any) {
          throw error;
      } finally {
          setIsLoading(false);
      }
  };

  /**
   * Send OTP
   */
  const sendOtp = async () => {
      if (!tempEmail) throw new Error('No email found for verification');
      try {
          await authService.sendOtp({ email: tempEmail });
      } catch (error) {
          throw error;
      }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      await clearAuthData(); // Ensure local cleanup even if API fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    tempEmail,
    login,
    register,
    verifyOtp,
    sendOtp,
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
