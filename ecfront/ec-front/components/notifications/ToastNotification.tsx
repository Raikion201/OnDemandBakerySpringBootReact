'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../lib/hooks';
import { Notification } from '../../lib/websocketService';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  Package
} from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { notifications } = useAppSelector((state) => state.notifications);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    // Get the latest notification - safely handle undefined notifications array
    const safeNotifications = notifications || [];
    const latestNotification = safeNotifications[0];
    
    if (latestNotification && latestNotification.id !== lastNotificationId) {
      setLastNotificationId(latestNotification.id);
      
      // Show toast notification
      const getNotificationIcon = () => {
        switch (latestNotification.type) {
          case 'ORDER_CREATED':
            return <ShoppingBag className="h-5 w-5 text-blue-500" />;
          case 'ORDER_UPDATE':
            switch (latestNotification.orderStatus) {
              case 'PENDING':
                return <Clock className="h-5 w-5 text-yellow-500" />;
              case 'PROCESSING':
                return <Package className="h-5 w-5 text-blue-500" />;
              case 'SHIPPED':
                return <Truck className="h-5 w-5 text-purple-500" />;
              case 'DELIVERED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
              case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-500" />;
              default:
                return <Package className="h-5 w-5 text-gray-500" />;
            }
          default:
            return <Package className="h-5 w-5 text-gray-500" />;
        }
      };

      const getToastType = () => {
        switch (latestNotification.type) {
          case 'ORDER_CREATED':
            return 'success';
          case 'ORDER_UPDATE':
            if (latestNotification.orderStatus === 'DELIVERED') {
              return 'success';
            } else if (latestNotification.orderStatus === 'CANCELLED') {
              return 'error';
            }
            return 'info';
          default:
            return 'info';
        }
      };

      toast[getToastType()](latestNotification.title, {
        description: latestNotification.message,
        duration: 5000,
        icon: getNotificationIcon()
        
      });
    }
  }, [notifications, lastNotificationId]);

  return null; // This component doesn't render anything visible
};

