package com.ecspring.entity;

public enum OrderStatus {
    PENDING,           // Đơn hàng mới được tạo, chưa được xác nhận
    CONFIRMED,         // Đơn hàng đã được xác nhận
    PREPARING,         // Đơn hàng đang được chuẩn bị
    READY_FOR_DELIVERY, // Đơn hàng đã sẵn sàng để giao
    OUT_FOR_DELIVERY,  // Đơn hàng đang được giao
    DELIVERED,         // Đơn hàng đã giao thành công
    CANCELLED          // Đơn hàng đã bị hủy
}