'use client';

import React from 'react';
import { useWebSocketStatus } from '../../lib/features/notifications/useWebSocketStatus';
import { Badge } from '../ui/badge';

export const WebSocketStatus: React.FC = () => {
  const { isConnected, isUserLoggedIn, username } = useWebSocketStatus();

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg z-50">
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span>WebSocket:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span>User:</span>
          <Badge variant={isUserLoggedIn ? "default" : "secondary"}>
            {isUserLoggedIn ? `@${username}` : 'Not logged in'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
