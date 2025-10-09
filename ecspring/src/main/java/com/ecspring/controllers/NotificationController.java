package com.ecspring.controllers;

import com.ecspring.entity.NotificationEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.NotificationPersistenceService;
import com.ecspring.services.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationPersistenceService notificationPersistenceService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("WebSocket notification service is running");
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<NotificationEntity> notifications = notificationPersistenceService.getNotificationsByUser(user, pageable);
            Long unreadCount = notificationPersistenceService.getUnreadCountByUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications.getContent());
            response.put("totalElements", notifications.getTotalElements());
            response.put("totalPages", notifications.getTotalPages());
            response.put("currentPage", notifications.getNumber());
            response.put("unreadCount", unreadCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get notifications", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get notifications"));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications() {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            List<NotificationEntity> unreadNotifications = notificationPersistenceService.getUnreadNotificationsByUser(user);
            return ResponseEntity.ok(unreadNotifications);
        } catch (Exception e) {
            log.error("Failed to get unread notifications", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            Long unreadCount = notificationPersistenceService.getUnreadCountByUser(user);
            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            log.error("Failed to get unread count", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            notificationPersistenceService.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            log.error("Failed to mark notification as read", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark notification as read"));
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            notificationPersistenceService.markAllAsReadByUser(user);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            log.error("Failed to mark all notifications as read", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark all notifications as read"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        try {
            UserEntity user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            notificationPersistenceService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (Exception e) {
            log.error("Failed to delete notification", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete notification"));
        }
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(
            @RequestParam String orderNumber,
            @RequestParam String orderStatus,
            @RequestParam Long userId,
            @RequestParam String username) {
        
        try {
            // This endpoint is kept for testing purposes
            // The actual notification sending is handled by the NotificationService
            return ResponseEntity.ok("Test notification endpoint - use NotificationService for actual notifications");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send notification: " + e.getMessage());
        }
    }

    @PostMapping("/test-write")
    public ResponseEntity<String> testWriteNotification(
            @RequestParam String orderNumber,
            @RequestParam String orderStatus,
            @RequestParam String username) {
        
        try {
            log.info("🧪 Testing write notification - Order: {}, Status: {}, User: {}", 
                    orderNumber, orderStatus, username);
            
            // Find user by username
            UserEntity user = userRepository.findByUsername(username);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found: " + username);
            }
            
            // Send notification using the service
            notificationService.sendOrderUpdateNotification(orderNumber, orderStatus, user.getId(), username);
            
            return ResponseEntity.ok("Test write notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send test write notification", e);
            return ResponseEntity.badRequest().body("Failed to send notification: " + e.getMessage());
        }
    }

    private UserEntity getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                return userRepository.findByUsername(username);
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to get current user", e);
            return null;
        }
    }
}