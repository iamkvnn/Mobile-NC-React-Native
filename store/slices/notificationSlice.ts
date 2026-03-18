import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notification.service';
import { Notification } from '../../types/notification.types';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  wsConnected: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page, limit }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const toggleNotificationRead = createAsyncThunk(
  'notifications/toggleRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.toggleReadStatus(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle read status');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setWsConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Toggle Read Status
      .addCase(toggleNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const index = state.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          const wasRead = state.notifications[index].isRead;
          state.notifications[index].isRead = !wasRead;
          state.unreadCount += wasRead ? 1 : -1;
        }
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const index = state.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          if (!state.notifications[index].isRead) {
            state.unreadCount -= 1;
          }
          state.notifications.splice(index, 1);
        }
      });
  },
});

export const { addNotification, setWsConnectionStatus, clearNotifications } = notificationSlice.actions;

export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationState }) => state.notifications.loading;

export default notificationSlice.reducer;
