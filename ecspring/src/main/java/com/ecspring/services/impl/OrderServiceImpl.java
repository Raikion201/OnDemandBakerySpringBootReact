package com.ecspring.services.impl;

import com.ecspring.dto.OrderDto;
import com.ecspring.dto.OrderItemDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.OrderRepository;
import com.ecspring.services.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<OrderDto> getOrdersByUser(UserEntity user) {
        List<OrderEntity> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(this::mapToOrderDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto getOrderById(Long orderId, UserEntity user) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Kiểm tra xem đơn hàng có phải của người dùng hiện tại không
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view this order");
        }
        
        return mapToOrderDto(order);
    }
    
    private OrderDto mapToOrderDto(OrderEntity order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setStatus(order.getStatus());
        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setDeliveryAddress(order.getDeliveryAddress());
        orderDto.setContactPhone(order.getContactPhone());
        
        // Thêm thông tin tracking
        orderDto.setConfirmedTime(order.getConfirmedTime());
        orderDto.setPreparingTime(order.getPreparingTime());
        orderDto.setReadyForDeliveryTime(order.getReadyForDeliveryTime());
        orderDto.setOutForDeliveryTime(order.getOutForDeliveryTime());
        orderDto.setDeliveredTime(order.getDeliveredTime());
        orderDto.setCancelledTime(order.getCancelledTime());
        
        // Map các order items
        List<OrderItemDto> itemDtos = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setId(item.getId());
                    itemDto.setProductName(item.getProductName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setSubtotal(item.getSubtotal());
                    return itemDto;
                })
                .collect(Collectors.toList());
        orderDto.setItems(itemDtos);
        
        return orderDto;
    }
}