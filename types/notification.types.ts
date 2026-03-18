// Notification Types

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification[];
  meta: PaginationMeta;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: number;
}

export interface ToggleReadResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
  data: null;
}
