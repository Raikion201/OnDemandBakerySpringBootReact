'use client';

import React from 'react';
import { Notification } from '../../lib/websocketService';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  Package,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'ORDER_CREATED':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'ORDER_UPDATE':
        switch (notification.orderStatus) {
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

  const getStatusColor = () => {
    switch (notification.orderStatus) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <Card className={`transition-all duration-200 ${
      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {notification.message}
              </p>
              
              <div className="space-y-2">
                
                
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>
      </CardContent>
    </Card>
  );
};

