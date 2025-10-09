'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useWebSocketStatus = () => {
  const { isConnected, notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );
  const { user } = useSelector((state: RootState) => state.auth);

  return {
    isConnected,
    notifications,
    unreadCount,
    isUserLoggedIn: !!user?.username,
    username: user?.username,
  };
};
