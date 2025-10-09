package com.ecspring.services;

import com.ecspring.dto.NotificationDto;

public interface NotificationService {
    void sendOrderNotification(NotificationDto notification);
    void sendOrderUpdateNotification(String orderNumber, String orderStatus, Long userId, String username);
    void sendOrderCreatedNotification(String orderNumber, Long userId, String username);
}

