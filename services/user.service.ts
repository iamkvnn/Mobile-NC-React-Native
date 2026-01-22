import { apiService } from './api.service';
import { User } from '@/types/api.types';

/**
 * User Service
 * Handles all user-related API calls
 */
class UserService {
  private readonly USER_ENDPOINTS = {
    ME: '/user/me',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/password',
  };

  /**
   * Get current user profile
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>(this.USER_ENDPOINTS.ME);
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param data - User data to update
   * @returns Updated user data
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>(
        this.USER_ENDPOINTS.UPDATE_PROFILE,
        data
      );
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post(this.USER_ENDPOINTS.CHANGE_PASSWORD, {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
