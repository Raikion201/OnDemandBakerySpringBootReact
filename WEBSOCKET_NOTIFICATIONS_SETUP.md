# WebSocket Notifications Setup Guide

This guide explains how to set up and use the WebSocket notification system for real-time order updates in your bakery application.

## Overview

The WebSocket notification system allows users to receive real-time notifications when their orders are created or updated. The system consists of:

1. **Backend (Spring Boot)**: WebSocket server that sends notifications
2. **Frontend (React)**: WebSocket client that receives and displays notifications

## Backend Implementation

### Dependencies Added
- `spring-boot-starter-websocket`
- `spring-messaging`

### Key Components

#### 1. WebSocket Configuration (`WebSocketConfig.java`)
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    // Configures STOMP endpoints and message broker
}
```

#### 2. Notification Service (`NotificationService.java` & `NotificationServiceImpl.java`)
- Sends notifications to specific users via WebSocket
- Handles order creation and update notifications
- Supports both user-specific and admin notifications

#### 3. Order Service Integration
- Automatically sends notifications when orders are created
- Sends notifications when order status is updated
- Integrated into `OrderServiceImpl.java`

#### 4. Security Configuration
- WebSocket endpoints (`/ws/**`) are permitted for all users
- STOMP topics (`/topic/**`) are accessible without authentication

### Notification Types

1. **ORDER_CREATED**: When a new order is placed
2. **ORDER_UPDATE**: When order status changes (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

### WebSocket Endpoints

- **Connection**: `ws://localhost:8080/ws`
- **User Notifications**: `/topic/notifications/user/{userId}`
- **Admin Notifications**: `/topic/notifications/admin`

## Frontend Implementation

### Dependencies Added
- `@stomp/stompjs`: STOMP client for WebSocket communication
- `sockjs-client`: WebSocket fallback support

### Key Components

#### 1. WebSocket Service (`websocketService.ts`)
- Manages WebSocket connection
- Handles automatic reconnection
- Processes incoming notifications

#### 2. Redux Store Integration
- `notificationSlice.ts`: Manages notification state
- Stores notifications, unread count, and connection status

#### 3. UI Components
- `NotificationBell.tsx`: Notification bell with unread count
- `NotificationItem.tsx`: Individual notification display
- `ToastNotification.tsx`: Real-time toast notifications
- `NotificationProvider.tsx`: Context provider for WebSocket management

### Notification Features

1. **Real-time Notifications**: Instant delivery via WebSocket
2. **Toast Notifications**: Pop-up notifications for new updates
3. **Notification Bell**: Persistent notification center
4. **Unread Count**: Badge showing number of unread notifications
5. **Connection Status**: Visual indicator of WebSocket connection
6. **Auto-reconnection**: Automatic reconnection on connection loss

## Testing the System

### Manual Testing Endpoints

#### Test Order Update Notification
```bash
POST /api/notifications/test
Parameters:
- orderNumber: "ORD-20241201-1234"
- orderStatus: "PROCESSING"
- userId: 1
- username: "john_doe"
```

#### Test Order Created Notification
```bash
POST /api/notifications/test-created
Parameters:
- orderNumber: "ORD-20241201-1234"
- userId: 1
- username: "john_doe"
```

### Testing Steps

1. **Start the Backend**:
   ```bash
   cd ecspring
   ./mvnw spring-boot:run
   ```

2. **Start the Frontend**:
   ```bash
   cd ecfront/ec-front
   npm run dev
   ```

3. **Login to the Application**: Use any valid user credentials

4. **Test Notifications**:
   - Use the test endpoints above to send notifications
   - Check the notification bell in the navbar
   - Verify toast notifications appear
   - Test different order statuses

## Configuration

### Backend Configuration
- WebSocket endpoint: `/ws`
- STOMP broker prefix: `/topic`
- Application destination prefix: `/app`

### Frontend Configuration
- WebSocket URL: `ws://localhost:8080/ws`
- Reconnection attempts: 5
- Reconnection interval: 5 seconds

## Security Considerations

1. **CORS**: Configured to allow all origins (adjust for production)
2. **Authentication**: WebSocket connections don't require authentication
3. **Authorization**: User-specific notifications are filtered by userId

## Production Deployment

### Backend
1. Configure proper CORS origins
2. Use HTTPS for WebSocket connections (wss://)
3. Implement proper authentication for WebSocket connections
4. Configure load balancer for WebSocket sticky sessions

### Frontend
1. Update WebSocket URL to production endpoint
2. Implement proper error handling
3. Add connection retry logic
4. Consider implementing notification persistence

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check if backend is running on port 8080
   - Verify WebSocket endpoint is accessible
   - Check browser console for errors

2. **Notifications Not Received**:
   - Verify user is logged in
   - Check WebSocket connection status
   - Ensure correct userId is being used

3. **Reconnection Issues**:
   - Check network connectivity
   - Verify WebSocket service is properly configured
   - Monitor browser console for connection errors

### Debug Information

Enable debug logging in the WebSocket service:
```typescript
// In websocketService.ts
debug: (str) => {
  console.log('STOMP Debug:', str);
}
```

## Future Enhancements

1. **Notification Persistence**: Store notifications in database
2. **Push Notifications**: Browser push notifications for offline users
3. **Email Integration**: Send email notifications as backup
4. **Notification Preferences**: Allow users to configure notification types
5. **Real-time Chat**: Extend WebSocket for customer support chat
6. **Order Tracking**: Real-time order tracking updates

## API Reference

### Notification DTO Structure
```json
{
  "id": "uuid",
  "type": "ORDER_CREATED | ORDER_UPDATE",
  "title": "Order Status Updated",
  "message": "Your order has been processed",
  "orderNumber": "ORD-20241201-1234",
  "orderStatus": "PROCESSING",
  "userId": 1,
  "username": "john_doe",
  "timestamp": "2024-12-01T10:30:00",
  "read": false
}
```

This WebSocket notification system provides a robust, real-time communication channel between your backend and frontend, ensuring users stay informed about their order status changes instantly.

