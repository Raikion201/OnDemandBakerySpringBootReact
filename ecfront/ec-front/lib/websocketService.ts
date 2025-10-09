import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';

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

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  private notificationCallbacks: ((notification: Notification) => void)[] = [];

  constructor() {
    console.log('🏗️ WebSocketService instance created');
  }

  connect(username?: string, isAdmin: boolean = false) {
    if (this.isConnected && this.client) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    console.log('🔌 Attempting to connect to WebSocket...', { username, isAdmin });
    console.log('🔍 Current connection state:', { 
      isConnected: this.isConnected, 
      hasClient: !!this.client,
      username,
      isAdmin
    });

    try {
      // Create SockJS connection
      const socket = new SockJS('http://localhost:8080/ws');
      
      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectInterval,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('✅ WebSocket connected successfully!', frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Subscribe to user-specific notifications if username is provided
          if (username) {
            this.subscribeToUserNotifications(username);
          }

          // Only subscribe to admin notifications if user is admin
          if (isAdmin) {
            this.subscribeToAdminNotifications();
          }
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame);
          this.isConnected = false;
        },
        onWebSocketClose: (event) => {
          console.log('🔌 WebSocket disconnected:', event);
          this.isConnected = false;
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
        }
      });

      console.log('🚀 Activating STOMP client...');
      this.client.activate();
      console.log('✅ STOMP client activation initiated');
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      this.isConnected = false;
      this.attemptReconnect();
    }
  }

  private subscribeToUserNotifications(username: string) {
    if (!this.client || !this.isConnected) {
      return;
    }

    const subscription = this.client.subscribe(
      `/topic/notifications/user/${username}`,
      (message) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );

    console.log('Subscribed to user notifications for username:', username);
  }

  private subscribeToAdminNotifications() {
    if (!this.client || !this.isConnected) {
      return;
    }

    const subscription = this.client.subscribe(
      '/topic/notifications/admin',
      (message) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Error parsing admin notification:', error);
        }
      }
    );

    console.log('Subscribed to admin notifications');
  }

  private handleNotification(notification: Notification) {
    console.log('Received notification:', notification);
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback);
  }

  removeNotificationCallback(callback: (notification: Notification) => void) {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  sendMessage(destination: string, message: any) {
    if (this.client && this.isConnected) {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.notificationCallbacks = [];
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();




