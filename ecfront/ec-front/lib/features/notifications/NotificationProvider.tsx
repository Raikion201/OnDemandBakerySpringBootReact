'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RootState } from '../store';
import { addNotification, setConnectionStatus, fetchNotifications } from './notificationSlice';
import { webSocketService, Notification } from '../../websocketService';
import { useAppDispatch, useAppSelector } from '../../hooks.ts';

interface NotificationContextType {
  connect: (username?: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  loadNotificationHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { adminUser } = useAppSelector((state) => state.adminAuth);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    console.log('🚀 NotificationProvider mounted, checking for existing user...');
    
    // Check if user exists in Redux state
    if (user?.id) {
      console.log('👤 Found user in Redux state, connecting WebSocket for user:', user.username);
      const isAdmin = user.roles?.includes('ADMIN') || false;
      webSocketService.connect(user.username, isAdmin);
    } else {
      // Check localStorage for user (in case Redux hasn't loaded yet)
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.username) {
            console.log('👤 Found user in localStorage, connecting WebSocket for user:', parsedUser.username);
            const isAdmin = parsedUser.roles?.includes('ADMIN') || false;
            webSocketService.connect(parsedUser.username, isAdmin);
          }
        }
      } catch (error) {
        console.log('No user found in localStorage or error parsing:', error);
      }
    }
  }, []); // Run only on mount

  useEffect(() => {
    // Set up WebSocket notification handler
    const handleNotification = (notification: Notification) => {
      console.log('📨 Received notification:', notification);
      dispatch(addNotification(notification));
    };

    webSocketService.onNotification(handleNotification);

    return () => {
      webSocketService.removeNotificationCallback(handleNotification);
    };
  }, [dispatch]);

  // Function to load notification history
  const loadNotificationHistory = () => {
    if (user?.username) {
      console.log('📚 Loading notification history for user:', user.username);
      dispatch(fetchNotifications());
    }
  };

  // Separate effect for user-based connection
  useEffect(() => {
    // Connect if user is logged in
    if (user?.username) {
      console.log('👤 User logged in, connecting WebSocket for user:', user.username);
      const isAdmin = user.roles?.includes('ADMIN') || false;
      webSocketService.connect(user.username, isAdmin);
      
      // Load notification history from database
      loadNotificationHistory();
      
      // Update connection status
      setTimeout(() => {
        const connected = webSocketService.isWebSocketConnected();
        setIsConnected(connected);
        dispatch(setConnectionStatus(connected));
      }, 1000);
    } else {
      console.log('👤 No user logged in, disconnecting WebSocket');
      webSocketService.disconnect();
      setIsConnected(false);
      dispatch(setConnectionStatus(false));
    }
  }, [user?.username, user?.roles, dispatch]);

  const connect = (username?: string) => {
    try {
      console.log('🔌 Attempting to connect WebSocket...');
      const isAdmin = user?.roles?.includes('ADMIN') || false;
      webSocketService.connect(username, isAdmin);
      
      // Set connected state immediately, will be updated by monitoring
      setIsConnected(true);
      dispatch(setConnectionStatus(true));
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      setIsConnected(false);
      dispatch(setConnectionStatus(false));
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting WebSocket...');
    webSocketService.disconnect();
    setIsConnected(false);
    dispatch(setConnectionStatus(false));
  };

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = webSocketService.isWebSocketConnected();
      if (connected !== isConnected) {
        console.log('🔄 Connection status changed:', connected);
        setIsConnected(connected);
        dispatch(setConnectionStatus(connected));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, dispatch]);

  const contextValue: NotificationContextType = {
    connect,
    disconnect,
    isConnected,
    loadNotificationHistory,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

