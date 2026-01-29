import { apiService } from './api.service';
import { User, UpdateUserRequest, UpdateUserFormData } from '@/types/api.types';

/**
 * User Service
 * Handles all user-related API calls
 */
class UserService {
  private readonly USER_ENDPOINTS = {
    ME: '/users/me',
    UPDATE_USER: (id: string) => `/users/${id}`,
  };

  /**
   * Get current user profile
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<any>(this.USER_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile by ID
   * PUT /api/v1/users/{id}
   * @param id - User ID
   * @param data - User data to update (name, gender)
   * @returns Updated user data
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiService.put<any>(
        this.USER_ENDPOINTS.UPDATE_USER(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  /**
   * Update user profile with avatar
   * PUT /api/v1/users/{id} (multipart/form-data)
   * @param id - User ID  
   * @param data - User data and optional avatar file
   * @returns Updated user data
   */
  async updateUserWithAvatar(id: string, data: UpdateUserFormData): Promise<User> {
    try {
      const formData = new FormData();
      
      // Add user data as JSON blob
      formData.append('user', JSON.stringify(data.user));
      
      // Add avatar file if provided
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch(
        `${apiService.getBaseURL()}${this.USER_ENDPOINTS.UPDATE_USER(id)}`,
        {
          method: 'PUT',
          headers: {
            ...apiService.getAuthHeaders(),
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update user with avatar error:', error);
      throw error;
    }
  }}

export const userService = new UserService();
