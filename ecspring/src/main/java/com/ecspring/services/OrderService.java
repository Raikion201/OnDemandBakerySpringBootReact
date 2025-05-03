package com.ecspring.services;

import com.ecspring.dto.OrderDto;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    OrderDto createOrderFromCart(Long userId);
    OrderDto getOrderById(Long id);
    OrderDto getOrderByOrderNumber(String orderNumber);
    List<OrderDto> getAllOrders();
    List<OrderDto> getOrdersByUser(Long userId);
    List<OrderDto> getOrdersByStatus(String status);
    List<OrderDto> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    OrderDto updateOrderStatus(Long id, String status);
    void deleteOrder(Long id);
    String generateOrderNumber();
}
