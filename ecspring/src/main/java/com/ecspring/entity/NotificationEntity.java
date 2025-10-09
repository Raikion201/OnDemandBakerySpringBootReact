package com.ecspring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name="notifications")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
public class NotificationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name="notification_id", unique=true, nullable=false)
    private String notificationId; // UUID for external reference
    
    @Column(name="type", nullable=false)
    private String type; // ORDER_CREATED, ORDER_UPDATE, etc.
    
    @Column(name="title", nullable=false)
    private String title;
    
    @Column(name="message", nullable=false, columnDefinition="TEXT")
    private String message;
    
    @Column(name="order_number")
    private String orderNumber;
    
    @Column(name="order_status")
    private String orderStatus;
    
    @Column(name="read_status", nullable=false)
    private Boolean read = false;
    
    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;
    
    // Relationship with UserEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private UserEntity user;
    
    // Optional relationship with OrderEntity (for order-related notifications)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_id")
    private OrderEntity order;
    
    public NotificationEntity(String notificationId, String type, String title, String message, 
                            String orderNumber, String orderStatus, UserEntity user, OrderEntity order) {
        this.notificationId = notificationId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.orderNumber = orderNumber;
        this.orderStatus = orderStatus;
        this.user = user;
        this.order = order;
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }
}

