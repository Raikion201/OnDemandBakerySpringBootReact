package com.ecspring.repositories;

import com.ecspring.entity.NotificationEntity;
import com.ecspring.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    
    // Find notifications by user, ordered by creation date (newest first)
    List<NotificationEntity> findByUserOrderByCreatedAtDesc(UserEntity user);
    
    // Find notifications by user with pagination
    Page<NotificationEntity> findByUserOrderByCreatedAtDesc(UserEntity user, Pageable pageable);
    
    // Find unread notifications by user
    List<NotificationEntity> findByUserAndReadOrderByCreatedAtDesc(UserEntity user, Boolean read);
    
    // Count unread notifications by user
    Long countByUserAndRead(UserEntity user, Boolean read);
    
    // Find notifications by user and type
    List<NotificationEntity> findByUserAndTypeOrderByCreatedAtDesc(UserEntity user, String type);
    
    // Find notifications by user and order
    List<NotificationEntity> findByUserAndOrderOrderByCreatedAtDesc(UserEntity user, com.ecspring.entity.OrderEntity order);
    
    // Find notifications by notification ID (external reference)
    Optional<NotificationEntity> findByNotificationId(String notificationId);
    
    // Find notifications by date range
    List<NotificationEntity> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
        UserEntity user, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find notifications by user, order status, and read status
    List<NotificationEntity> findByUserAndOrderStatusAndReadOrderByCreatedAtDesc(
        UserEntity user, String orderStatus, Boolean read);
    
    // Delete old notifications (for cleanup)
    void deleteByUserAndCreatedAtBefore(UserEntity user, LocalDateTime cutoffDate);
    
    // Mark all notifications as read for a user
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.user = :user")
    void markAllAsReadByUser(@Param("user") UserEntity user);
    
    // Mark specific notification as read
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.id = :id")
    void markAsReadById(@Param("id") Long id);
}

