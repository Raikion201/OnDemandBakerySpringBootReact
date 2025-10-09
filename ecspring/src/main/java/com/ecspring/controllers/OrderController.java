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
            OrderDto newOrder = orderService.createOrderFromRequest(userDetails.getUsername(), checkoutRequest);
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

    // Update order status (accessible to both user and admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "You must be logged in to update an order"));
            }
            
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status cannot be empty"));
            }
            
            // Get the order to check ownership
            OrderDto order = orderService.getOrderById(id);
            String orderUsername = order.getUserName(); // Get the order owner's username
                    
            // Check if user is admin or order owner
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                                  a.getAuthority().equals("ROLE_STAFF") ||
                                  a.getAuthority().equals("ROLE_OWNER"));
            
            boolean isOrderOwner = userDetails.getUsername().equals(orderUsername);
            
            // Regular users can only change to CANCELLED and only their own PENDING orders
            if (!isAdmin && (!isOrderOwner || 
                             !order.getStatus().equals("PENDING") ||
                             !newStatus.equals("CANCELLED"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only cancel your own pending orders"));
            }
            
            OrderDto updatedOrder = orderService.updateOrderStatus(id, newStatus.toUpperCase());
            return ResponseEntity.ok(updatedOrder);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get user's orders with filtering options
    @GetMapping("/my-orders")
    public ResponseEntity<?> getUserOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String status) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "You must be logged in to view your orders"));
            }
            
            List<OrderDto> orders;
            
            // If status filter is provided, filter the user's orders by status
            if (status != null && !status.trim().isEmpty()) {
                orders = orderService.getOrdersByUsernameAndStatus(userDetails.getUsername(), status.toUpperCase());
            } else {
                orders = orderService.getOrdersByUsername(userDetails.getUsername());
            }
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching user orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
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
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
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
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
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

    // Delete order (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
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

    // Analytics endpoints for admin dashboard
    @GetMapping("/analytics/revenue")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
    public ResponseEntity<?> getRevenueAnalytics() {
        try {
            Map<String, Object> analytics = orderService.getRevenueAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error fetching revenue analytics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/daily-revenue")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
    public ResponseEntity<?> getDailyRevenue(
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<Map<String, Object>> dailyRevenue = orderService.getDailyRevenue(days);
            return ResponseEntity.ok(dailyRevenue);
        } catch (Exception e) {
            log.error("Error fetching daily revenue: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/monthly-revenue")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
    public ResponseEntity<?> getMonthlyRevenue(
            @RequestParam(defaultValue = "12") int months) {
        try {
            List<Map<String, Object>> monthlyRevenue = orderService.getMonthlyRevenue(months);
            return ResponseEntity.ok(monthlyRevenue);
        } catch (Exception e) {
            log.error("Error fetching monthly revenue: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/order-stats")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF','ROLE_OWNER')")
    public ResponseEntity<?> getOrderStats() {
        try {
            Map<String, Object> stats = orderService.getOrderStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching order stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
