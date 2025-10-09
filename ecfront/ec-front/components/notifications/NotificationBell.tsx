'use client';

import React, { useState } from 'react';
import { markAsRead, markAllAsRead, markNotificationAsRead } from '../../lib/features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { NotificationItem } from './NotificationItem';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications
  );
  
  // Safely handle notifications array
  const safeNotifications = notifications || [];

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = () => {
    if (unreadCount > 0) {
      return <BellRing className="h-6 w-6 text-orange-500" />;
    }
    return <Bell className="h-6 w-6 text-gray-500" />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {getNotificationIcon()}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            Notifications
          </SheetTitle>
          <SheetDescription>
            Stay updated with your order status and important updates.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {safeNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll receive updates about your orders here</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 && `${unreadCount} unread`}
                </p>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {safeNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={(id) => {
                      // Try to parse as number for database ID, fallback to string
                      const dbId = parseInt(id);
                      if (!isNaN(dbId)) {
                        dispatch(markNotificationAsRead(dbId));
                      } else {
                        dispatch(markAsRead(id));
                      }
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

