import { apiService } from './api.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthData, 
  VerifyOtpRequest, 
  ResendOtpRequest, 
  RefreshTokenRequest,
  Tokens,
  ApiResponse
} from '@/types/api.types';

/**
 * Authentication Service
 * Handles all authentication related API calls
 */
class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  };

  /**
   * Login user
   * @param credentials - Email and password
   * @returns Authentication data
   */
  async login(credentials: LoginRequest): Promise<AuthData> {
    const response = await apiService.post<ApiResponse<AuthData>>(
      this.AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  }

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Authentication data
   */
  async register(userData: RegisterRequest): Promise<AuthData> {
    const response = await apiService.post<ApiResponse<AuthData>>(
      this.AUTH_ENDPOINTS.REGISTER,
      userData
    );
    return response.data;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthData> {
    const response = await apiService.post<ApiResponse<AuthData>>(
      this.AUTH_ENDPOINTS.VERIFY_OTP,
      data
    );
    return response.data;
  }

  /**
   * Resend OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<void> {
    await apiService.post(
      this.AUTH_ENDPOINTS.RESEND_OTP,
      data
    );
  }

  /**
   * Refresh Token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<Tokens> {
    const response = await apiService.post<ApiResponse<Tokens>>(
      this.AUTH_ENDPOINTS.REFRESH,
      data
    );
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(this.AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if network fails, client should clear state
    }
  }
}

export const authService = new AuthService();