package com.ecspring.services;

import com.ecspring.dto.OrderDto;
import com.ecspring.dto.CheckoutRequestDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    
    // Analytics methods
    Map<String, Object> getRevenueAnalytics();
    List<Map<String, Object>> getDailyRevenue(int days);
    List<Map<String, Object>> getMonthlyRevenue(int months);
    Map<String, Object> getOrderStats();
}
