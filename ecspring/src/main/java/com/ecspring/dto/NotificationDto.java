package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String type;
    private String title;
    private String message;
    private String orderNumber;
    private String orderStatus;
    private Long userId;
    private String username;
    private LocalDateTime timestamp;
    private boolean read;

    public NotificationDto(String type, String title, String message, String orderNumber, 
                          String orderStatus, Long userId, String username) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.orderNumber = orderNumber;
        this.orderStatus = orderStatus;
        this.userId = userId;
        this.username = username;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }
}

