package com.ecspring.controllers;

import com.ecspring.dto.OrderDto;
import com.ecspring.entity.UserEntity;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.OrderService;
import com.ecspring.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {
    
    private final OrderService orderService;
    private final UserService userService;
    
    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDto>> getUserOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserEntity user = userService.findUserByUsername(userDetails.getUsername());
            List<OrderDto> orders = orderService.getOrdersByUser(user);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting user orders: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> getOrderDetails(
            @PathVariable Long orderId, 
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserEntity user = userService.findUserByUsername(userDetails.getUsername());
            OrderDto order = orderService.getOrderById(orderId, user);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Error getting order details: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}