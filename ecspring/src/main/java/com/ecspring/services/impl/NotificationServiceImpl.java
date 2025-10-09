package com.ecspring.services.impl;

import com.ecspring.dto.NotificationDto;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.NotificationService;
import com.ecspring.services.NotificationPersistenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationPersistenceService notificationPersistenceService;
    private final UserRepository userRepository;

    @Autowired
    public NotificationServiceImpl(
            SimpMessagingTemplate messagingTemplate,
            NotificationPersistenceService notificationPersistenceService,
            UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationPersistenceService = notificationPersistenceService;
        this.userRepository = userRepository;
    }

    @Override
    public void sendOrderNotification(NotificationDto notification) {
        try {
            log.info("📝 Processing notification: {} for user: {}", notification.getType(), notification.getUsername());
            
            // Set a unique ID for the notification if not already set
            if (notification.getId() == null || notification.getId().isEmpty()) {
                notification.setId(UUID.randomUUID().toString());
            }
            
            // Find user by username to persist notification
            log.info("🔍 Looking up user with username: {}", notification.getUsername());
            UserEntity user = userRepository.findByUsername(notification.getUsername());
            if (user != null) {
                log.info("✅ User found: {} (ID: {})", user.getUsername(), user.getId());
                // Persist notification to database
                notificationPersistenceService.saveNotification(notification, user);
                log.info("💾 Notification persisted to database for user: {}", notification.getUsername());
            } else {
                log.warn("⚠️ User not found for username: {}, skipping persistence", notification.getUsername());
                log.warn("⚠️ This means notifications will not be saved to database for this user!");
            }
            
            // Send to specific user's topic using username
            String destination = "/topic/notifications/user/" + notification.getUsername();
            messagingTemplate.convertAndSend(destination, notification);
            log.info("📡 WebSocket message sent to user topic: {}", destination);
            
            // Also send to admin topic for admin monitoring (only admins should subscribe to this)
            messagingTemplate.convertAndSend("/topic/notifications/admin", notification);
            log.info("📡 WebSocket message sent to admin topic: /topic/notifications/admin");
            
            log.info("✅ Notification sent successfully for order: {} to user: {}", 
                    notification.getOrderNumber(), notification.getUsername());
        } catch (Exception e) {
            log.error("❌ Failed to send notification for order: {} to user: {}", 
                     notification.getOrderNumber(), notification.getUsername(), e);
        }
    }

    @Override
    public void sendOrderUpdateNotification(String orderNumber, String orderStatus, Long userId, String username) {
        log.info("🚀 Sending order update notification - Order: {}, Status: {}, User: {} (ID: {})", 
                orderNumber, orderStatus, username, userId);
        
        String title = "Order Status Updated";
        String message = String.format("Your order %s status has been updated to: %s", orderNumber, orderStatus);
        
        NotificationDto notification = new NotificationDto(
            "ORDER_UPDATE",
            title,
            message,
            orderNumber,
            orderStatus,
            userId,
            username
        );
        
        sendOrderNotification(notification);
    }

    @Override
    public void sendOrderCreatedNotification(String orderNumber, Long userId, String username) {
        String title = "Order Created Successfully";
        String message = String.format("Your order %s has been created and is being processed", orderNumber);
        
        NotificationDto notification = new NotificationDto(
            "ORDER_CREATED",
            title,
            message,
            orderNumber,
            "PENDING",
            userId,
            username
        );
        
        sendOrderNotification(notification);
    }
}

