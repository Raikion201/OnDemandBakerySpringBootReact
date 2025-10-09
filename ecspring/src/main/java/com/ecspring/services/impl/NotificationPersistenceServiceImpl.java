package com.ecspring.services.impl;

import com.ecspring.dto.NotificationDto;
import com.ecspring.entity.NotificationEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.NotificationRepository;
import com.ecspring.services.NotificationPersistenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class NotificationPersistenceServiceImpl implements NotificationPersistenceService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public NotificationEntity saveNotification(NotificationDto notificationDto, UserEntity user) {
        try {
            // Check if notification already exists to avoid duplicates
            if (notificationExists(notificationDto.getId())) {
                log.warn("Notification with ID {} already exists, skipping save", notificationDto.getId());
                return getNotificationByExternalId(notificationDto.getId());
            }

            NotificationEntity notification = new NotificationEntity(
                notificationDto.getId(),
                notificationDto.getType(),
                notificationDto.getTitle(),
                notificationDto.getMessage(),
                notificationDto.getOrderNumber(),
                notificationDto.getOrderStatus(),
                user,
                null // Order relationship can be added later if needed
            );

            notification.setRead(notificationDto.isRead());
            
            NotificationEntity savedNotification = notificationRepository.save(notification);
            log.info("Notification saved successfully with ID: {}", savedNotification.getId());
            
            return savedNotification;
        } catch (Exception e) {
            log.error("Failed to save notification: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save notification", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationEntity> getNotificationsByUser(UserEntity user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationEntity> getNotificationsByUser(UserEntity user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationEntity> getUnreadNotificationsByUser(UserEntity user) {
        return notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCountByUser(UserEntity user) {
        return notificationRepository.countByUserAndRead(user, false);
    }

    @Override
    public void markAsRead(Long notificationId) {
        try {
            notificationRepository.markAsReadById(notificationId);
            log.info("Notification {} marked as read", notificationId);
        } catch (Exception e) {
            log.error("Failed to mark notification {} as read: {}", notificationId, e.getMessage());
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }

    @Override
    public void markAllAsReadByUser(UserEntity user) {
        try {
            notificationRepository.markAllAsReadByUser(user);
            log.info("All notifications marked as read for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Failed to mark all notifications as read for user {}: {}", user.getUsername(), e.getMessage());
            throw new RuntimeException("Failed to mark all notifications as read", e);
        }
    }

    @Override
    public void deleteNotification(Long notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            log.info("Notification {} deleted", notificationId);
        } catch (Exception e) {
            log.error("Failed to delete notification {}: {}", notificationId, e.getMessage());
            throw new RuntimeException("Failed to delete notification", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationEntity getNotificationByExternalId(String notificationId) {
        Optional<NotificationEntity> notification = notificationRepository.findByNotificationId(notificationId);
        return notification.orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean notificationExists(String notificationId) {
        return notificationRepository.findByNotificationId(notificationId).isPresent();
    }
}


