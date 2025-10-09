'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { useNotification } from '../../lib/features/notifications/NotificationProvider';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export const WebSocketDebug: React.FC = () => {
  const { isConnected, connect, disconnect } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog(`User status: ${user ? `Logged in as ${user.name || user.username} (ID: ${user.id})` : 'Not logged in'}`);
    addLog(`WebSocket status: ${isConnected ? 'Connected' : 'Disconnected'}`);
  }, [user, isConnected]);

  const handleConnect = () => {
    addLog('Attempting to connect...');
    connect(user?.username);
  };

  const handleDisconnect = () => {
    addLog('Disconnecting...');
    disconnect();
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications/status', {
        credentials: 'include'
      });
      if (response.ok) {
        const text = await response.text();
        addLog(`✅ Backend status: ${text}`);
      } else {
        addLog(`❌ Backend not responding: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Backend connection error: ${error}`);
    }
  };

  const testNotification = async () => {
    try {
      const params = new URLSearchParams({
        orderNumber: 'TEST-123',
        orderStatus: 'PROCESSING',
        userId: String(user?.id || 1),
        username: user?.username || 'test_user'
      });

      const response = await fetch(`http://localhost:8080/api/notifications/test?${params}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const text = await response.text();
        addLog(`✅ Test notification sent: ${text}`);
      } else {
        addLog(`❌ Failed to send test notification: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Error sending test notification: ${error}`);
    }
  };

  const testWebSocketConnection = () => {
    addLog('🔌 Testing WebSocket connection...');
    try {
      const ws = new WebSocket('ws://localhost:8080/ws');
      
      ws.onopen = () => {
        addLog('✅ WebSocket connection opened successfully');
        ws.close();
      };
      
      ws.onerror = (error) => {
        addLog(`❌ WebSocket connection error: ${error}`);
      };
      
      ws.onclose = () => {
        addLog('🔌 WebSocket connection closed');
      };
    } catch (error) {
      addLog(`❌ WebSocket test error: ${error}`);
    }
  };

  const testStompConnection = () => {
    addLog('🔌 Testing STOMP connection via service...');
    if (user?.username) {
      addLog(`Connecting for user ID: ${user.username}`);
      connect(user.username);
    } else {
      addLog('❌ No user logged in, cannot test STOMP connection');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WebSocket Debug Panel
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleConnect} disabled={isConnected}>
            Connect
          </Button>
          <Button onClick={handleDisconnect} disabled={!isConnected} variant="destructive">
            Disconnect
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">User Info:</h3>
          <p className="text-sm text-gray-600">
            {user ? `Logged in as ${user.name || user.username} (ID: ${user.id})` : 'Not logged in'}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Connection Info:</h3>
          <p className="text-sm text-gray-600">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </p>
          <p className="text-sm text-gray-600">
            URL: ws://localhost:8080/ws
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Test Actions:</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={checkBackendStatus} size="sm">
              Check Backend
            </Button>
            <Button onClick={testWebSocketConnection} size="sm">
              Test WebSocket
            </Button>
            <Button onClick={testStompConnection} disabled={!user} size="sm">
              Test STOMP
            </Button>
            <Button onClick={testNotification} disabled={!user} size="sm">
              Send Test Notification
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Debug Logs:</h3>
          <div className="bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
