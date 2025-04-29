package com.ecspring.services;

import com.ecspring.dto.OrderDto;
import com.ecspring.entity.UserEntity;

import java.util.List;

public interface OrderService {
    List<OrderDto> getOrdersByUser(UserEntity user);
    OrderDto getOrderById(Long orderId, UserEntity user);
}