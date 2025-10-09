package com.ecspring.services;

import com.ecspring.dto.NotificationDto;
import com.ecspring.entity.NotificationEntity;
import com.ecspring.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationPersistenceService {
    
    // Save notification to database
    NotificationEntity saveNotification(NotificationDto notificationDto, UserEntity user);
    
    // Get all notifications for a user
    List<NotificationEntity> getNotificationsByUser(UserEntity user);
    
    // Get notifications for a user with pagination
    Page<NotificationEntity> getNotificationsByUser(UserEntity user, Pageable pageable);
    
    // Get unread notifications for a user
    List<NotificationEntity> getUnreadNotificationsByUser(UserEntity user);
    
    // Count unread notifications for a user
    Long getUnreadCountByUser(UserEntity user);
    
    // Mark notification as read
    void markAsRead(Long notificationId);
    
    // Mark all notifications as read for a user
    void markAllAsReadByUser(UserEntity user);
    
    // Delete notification
    void deleteNotification(Long notificationId);
    
    // Get notification by external ID
    NotificationEntity getNotificationByExternalId(String notificationId);
    
    // Check if notification already exists
    boolean notificationExists(String notificationId);
}

