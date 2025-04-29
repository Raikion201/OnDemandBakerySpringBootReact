package com.ecspring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name="orders")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
public class OrderEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime orderDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @Column(nullable = false)
    private Double totalAmount;
    
    @Column
    private String deliveryAddress;
    
    @Column
    private String contactPhone;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> orderItems = new ArrayList<>();
    
    // Các trường trạng thái thời gian cho từng bước trong quy trình
    private LocalDateTime confirmedTime;
    private LocalDateTime preparingTime;
    private LocalDateTime readyForDeliveryTime;
    private LocalDateTime outForDeliveryTime;
    private LocalDateTime deliveredTime;
    private LocalDateTime cancelledTime;
}