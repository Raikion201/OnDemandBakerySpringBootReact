package com.ecspring.dto;

import com.ecspring.entity.OrderStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private Double totalAmount;
    private String deliveryAddress;
    private String contactPhone;
    private List<OrderItemDto> items;
    
    // Thông tin tracking đơn hàng
    private LocalDateTime confirmedTime;
    private LocalDateTime preparingTime;
    private LocalDateTime readyForDeliveryTime;
    private LocalDateTime outForDeliveryTime;
    private LocalDateTime deliveredTime;
    private LocalDateTime cancelledTime;
    
    // Tính toán tiến độ đơn hàng từ 0-100%
    public int getProgressPercentage() {
        if (status == OrderStatus.CANCELLED) {
            return 0;
        } else if (status == OrderStatus.DELIVERED) {
            return 100;
        }
        
        switch (status) {
            case PENDING: return 10;
            case CONFIRMED: return 25;
            case PREPARING: return 50;
            case READY_FOR_DELIVERY: return 75;
            case OUT_FOR_DELIVERY: return 90;
            default: return 0;
        }
    }
}