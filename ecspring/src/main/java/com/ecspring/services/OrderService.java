package com.ecspring.services;

import com.ecspring.dto.OrderDto;
import com.ecspring.dto.CheckoutRequestDto;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    OrderDto createOrderFromCart(Long userId);
    OrderDto createOrderFromRequest(String username, CheckoutRequestDto checkoutRequest);
    OrderDto getOrderById(Long id);
    OrderDto getOrderByOrderNumber(String orderNumber);
    List<OrderDto> getAllOrders();
    List<OrderDto> getOrdersByUser(Long userId);
    List<OrderDto> getOrdersByUserAndStatus(Long userId, String status);
    List<OrderDto> getOrdersByStatus(String status);
    List<OrderDto> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    OrderDto updateOrderStatus(Long id, String status);
    void deleteOrder(Long id);
    String generateOrderNumber();

    // Add these new methods that work with username
    List<OrderDto> getOrdersByUsername(String username);
    List<OrderDto> getOrdersByUsernameAndStatus(String username, String status);
}
