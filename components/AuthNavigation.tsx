import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  initializeAuth,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitialized,
} from '@/store/slices/authSlice';

interface AuthNavigationProps {
  children: React.ReactNode;
}

export function AuthNavigation({ children }: AuthNavigationProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isInitialized = useAppSelector(selectIsInitialized);
  const router = useRouter();
  const segments = useSegments();

  // Initialize auth state on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inAuthScreen = segments[0] === 'login' || 
                        segments[0] === 'register' || 
                        segments[0] === 'verify-otp' || 
                        segments[0] === 'forgot-password' || 
                        segments[0] === 'reset-password' ||
                        !segments[0]; // Root route

    if (!isAuthenticated && !inAuthScreen) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && (segments[0] === 'login' || segments[0] === 'register' || !segments[0])) {
      // Redirect to home if authenticated and on auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isInitialized, isLoading, router]);

  return <>{children}</>;
}