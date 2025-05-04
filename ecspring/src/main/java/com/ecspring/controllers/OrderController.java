package com.ecspring.controllers;

import com.ecspring.dto.OrderDto;
import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.exception.ResourceNotFoundException;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.OrderService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create order from checkout request
    @PostMapping("/checkout")  // Keep this as "/checkout"
    public ResponseEntity<?> createOrderFromRequest(
            @RequestBody @Valid CheckoutRequestDto checkoutRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            OrderDto newOrder = orderService.createOrderFromRequest(userDetails.getId(), checkoutRequest);
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            OrderDto order = orderService.getOrderById(id);
            
            // Only allow admins to view any order or users to view their own orders
            if (userDetails.getAuthorities().stream().anyMatch(a -> 
                    a.getAuthority().equals("ROLE_ADMIN") || 
                    a.getAuthority().equals("ROLE_STAFF")) || 
                order.getUserId().equals(userDetails.getId())) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have permission to view this order"));
            }
        } catch (Exception e) {
            log.error("Error fetching order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get order by order number
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            OrderDto order = orderService.getOrderByOrderNumber(orderNumber);
            
            // Only allow admins to view any order or users to view their own orders
            if (userDetails.getAuthorities().stream().anyMatch(a -> 
                    a.getAuthority().equals("ROLE_ADMIN") || 
                    a.getAuthority().equals("ROLE_STAFF")) || 
                order.getUserId().equals(userDetails.getId())) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have permission to view this order"));
            }
        } catch (Exception e) {
            log.error("Error fetching order by number: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get user's orders
    @GetMapping("/my-orders")
    public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<OrderDto> orders = orderService.getOrdersByUser(userDetails.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching user orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all orders (admin only)
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.ok(orderService.getAllOrders());
        } catch (Exception e) {
            log.error("Error fetching all orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get orders by status (admin only)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status.toUpperCase()));
        } catch (Exception e) {
            log.error("Error fetching orders by status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get orders by date range (admin only)
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByDateRange(startDate, endDate));
        } catch (Exception e) {
            log.error("Error fetching orders by date range: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update order status (admin only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status cannot be empty"));
            }
            
            OrderDto updatedOrder = orderService.updateOrderStatus(id, newStatus.toUpperCase());
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Delete order (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
