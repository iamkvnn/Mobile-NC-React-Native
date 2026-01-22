import { apiService } from './api.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types';

/**
 * Authentication Service
 * Handles all authentication related API calls
 */
class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  };

  /**
   * Login user
   * @param credentials - Email and password
   * @returns Authentication response with user data
   * @note Cookie is automatically set by the server with httpOnly flag
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        this.AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      // Cookie is set automatically by server in Set-Cookie header
      // No need to manually store anything on client side

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Authentication response with token and user data
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        this.AUTH_ENDPOINTS.REGISTER,
        userData
      );

      // Cookie is set automatically by server in Set-Cookie header
      // No need to manually store anything on client side
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * Clears stored token and calls logout endpoint
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint - server will clear the cookie
      await apiService.post(this.AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();