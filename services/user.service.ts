import { User, UpdateUserRequest } from '@/types/api.types';
import { apiService } from './api.service';
import { mime } from 'zod';
import { getMimeType } from '@/utils/mimeUtil';

class UserService {
  private readonly USER_ENDPOINTS = {
    ME: '/users/me',
    UPDATE_USER: (id: string) => `/users/${id}`,
  };

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<any>(this.USER_ENDPOINTS.ME);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserRequest, avatar?: File): Promise<User> {
    const formData = new FormData();
    formData.append('user', {
      string: JSON.stringify(data),
      type: 'application/json',
      name: 'user.json',
    } as any);
    if (avatar) {
      const uri = (avatar as any).uri as string;
      const fileName = (avatar as any).name || uri.split('/').pop() || 'avatar.jpg';
      const mimeType = getMimeType(fileName);
      formData.append('avatar', {
        uri,
        type: mimeType,
        name: fileName,
      } as any);
    }

    const response = await apiService.put(
      this.USER_ENDPOINTS.UPDATE_USER(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const userService = new UserService();