import { apiService } from './api.service';
import { 
  NotificationResponse, 
  UnreadCountResponse, 
  ToggleReadResponse, 
  DeleteNotificationResponse 
} from '../types/notification.types';

export const notificationService = {
  async getNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
    return await apiService.get<NotificationResponse>(`/notifications?page=${page}&limit=${limit}`);
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return await apiService.get<UnreadCountResponse>('/notifications/unread-count');
  },

  async toggleReadStatus(notificationId: string): Promise<ToggleReadResponse> {
    return await apiService.post<ToggleReadResponse>(`/notifications/${notificationId}/toggle-read`);
  },

  async deleteNotification(notificationId: string): Promise<DeleteNotificationResponse> {
    return await apiService.delete<DeleteNotificationResponse>(`/notifications/${notificationId}`);
  }
};
