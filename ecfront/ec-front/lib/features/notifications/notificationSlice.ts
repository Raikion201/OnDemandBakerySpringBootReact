import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApiService, Notification as ApiNotification } from './notificationApi';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderNumber?: string;
  orderStatus?: string;
  userId: number;
  username: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApiService.getAllNotifications();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const unreadCount = await notificationApiService.getUnreadCount();
      return unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await notificationApiService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

// Removed markAllNotificationsAsRead async thunk - using synchronous markAllAsRead instead

// Helper function to convert API notification to local notification
const convertApiNotification = (apiNotification: ApiNotification): Notification => ({
  id: apiNotification.notificationId, // Use notificationId as the unique identifier
  type: apiNotification.type,
  title: apiNotification.title,
  message: apiNotification.message,
  orderNumber: apiNotification.orderNumber,
  orderStatus: apiNotification.orderStatus,
  userId: 0, // Will be set by the notification provider
  username: '', // Will be set by the notification provider
  timestamp: apiNotification.createdAt,
  read: apiNotification.read,
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;
      // Check if notification already exists to avoid duplicates
      const exists = state.notifications.find(n => n.id === notification.id);
      if (!exists) {
        state.notifications.unshift(notification);
        if (!notification.read) {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loadNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Safely handle the response with null checks
        state.notifications = action.payload?.notifications?.map(convertApiNotification) || [];
        state.unreadCount = action.payload?.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId.toString());
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read - now handled by synchronous markAllAsRead reducer
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setConnectionStatus,
  setLoading,
  setError,
  loadNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

