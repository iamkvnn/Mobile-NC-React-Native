import { apiService } from './api.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthData, 
  VerifyOtpRequest, 
  ResendOtpRequest, 
  RefreshTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
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
    SEND_OTP: '/auth/send-otp',
    FORGOT_PASSWORD_INIT: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_CHANGE_PASSWORD_OTP: '/auth/send-change-password-otp',
    CHANGE_PASSWORD: '/auth/change-password',
    SEND_CHANGE_EMAIL_OTP: '/auth/send-change-email-otp',
    CHANGE_EMAIL: '/auth/change-email',
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
   * Send OTP
   */
  async sendOtp(data: ResendOtpRequest): Promise<void> {
    await apiService.post(
      this.AUTH_ENDPOINTS.SEND_OTP,
      data
    );
  }

  /**
   * Send forgot password OTP
   * @param email - User email
   */
  async sendForgotPasswordOtp(email: string): Promise<void> {
    await apiService.post<ApiResponse<void>>(
      this.AUTH_ENDPOINTS.SEND_OTP,
      { email }
    );
  }

  /**
   * Reset password
   * @param data - Reset password data
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiService.post<ApiResponse<void>>(
      this.AUTH_ENDPOINTS.RESET_PASSWORD,
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

  /**
   * Send OTP for changing password
   * POST /api/v1/auth/send-change-password-otp
   * @param email - User email
   */
  async sendChangePasswordOtp(email: string): Promise<void> {
    await apiService.post(this.AUTH_ENDPOINTS.SEND_CHANGE_PASSWORD_OTP, { email });
  }

  /**
   * Change password with OTP verification
   * POST /api/v1/auth/change-password
   * @param data - Change password data
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiService.post(this.AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  }

  /**
   * Send OTP for changing email
   * POST /api/v1/auth/send-change-email-otp
   * @param email - Current user email
   */
  async sendChangeEmailOtp(email: string): Promise<void> {
    await apiService.post(this.AUTH_ENDPOINTS.SEND_CHANGE_EMAIL_OTP, { email });
  }

  /**
   * Change email with OTP verification
   * POST /api/v1/auth/change-email
   * @param data - Change email data
   */
  async changeEmail(data: ChangeEmailRequest): Promise<void> {
    await apiService.post(this.AUTH_ENDPOINTS.CHANGE_EMAIL, data);
  }
}

export const authService = new AuthService();