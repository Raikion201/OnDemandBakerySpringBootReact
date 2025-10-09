import axios from '../../axiosConfig';

export interface NotificationResponse {
  notifications: Notification[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  unreadCount: number;
}

export interface Notification {
  id: number;
  notificationId: string;
  type: string;
  title: string;
  message: string;
  orderNumber?: string;
  orderStatus?: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

class NotificationApiService {
  // Get paginated notifications
  async getNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    try {
      const response = await axios.get(`/api/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Get all notifications (no pagination)
  async getAllNotifications(): Promise<NotificationResponse> {
    try {
      const response = await axios.get('/api/notifications?page=0&size=1000'); // Large size to get all
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all notifications:', error);
      throw error;
    }
  }

  // Get unread notifications only
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const response = await axios.get('/api/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get('/api/notifications/count');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await axios.put('/api/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
