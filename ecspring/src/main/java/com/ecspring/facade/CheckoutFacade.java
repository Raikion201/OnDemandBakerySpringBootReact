package com.ecspring.facade;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.dto.OrderDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.services.OrderService;
import com.ecspring.services.PaymentService;
import com.ecspring.services.ProductService;
import com.ecspring.services.EmailService;

import com.ecspring.entity.ProductEntity;
import com.ecspring.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class CheckoutFacade {

    private final OrderService orderService;
    private final ProductService productService;
    private final EmailService emailService;
    private final PaymentService paymentService;

    @Autowired
    public CheckoutFacade(
            OrderService orderService,
            ProductService productService,
            EmailService emailService,
            PaymentService paymentService) {
        log.info("Initializing CheckoutFacade with PaymentService: {}", 
                paymentService != null ? paymentService.getClass().getName() : "null");
        this.orderService = orderService;
        this.productService = productService;
        this.emailService = emailService;
        this.paymentService = paymentService;
    }

    /**
     * Single method to handle entire checkout process
     * Uses available services to create a streamlined checkout process
     */
    @Transactional
    public OrderDto processCheckout(String username, CheckoutRequestDto request) {
        try {
            log.info("Starting checkout process for user: {}", username);

            // Step 1: Validate product availability
            validateProductAvailability(request);

            // Step 2: Validate payment method
            if (!paymentService.validatePaymentMethod(request.getPaymentMethod())) {
                throw new IllegalArgumentException("Invalid payment method: " + request.getPaymentMethod());
            }

            // Step 3: Create order
            OrderDto order = orderService.createOrderFromRequest(username, request);

            // Step 4: Process payment using PaymentService (which internally uses PaymentProcessor)
            OrderEntity orderEntity = orderService.getOrderEntityById(order.getId());
            paymentService.processPayment(orderEntity, request);

            // Step 5: Send confirmation email
            sendOrderConfirmationEmail(order, username);

            log.info("Checkout completed successfully for order: {}", order.getOrderNumber());
            return order;

        } catch (Exception e) {
            log.error("Checkout failed for user: {}", username, e);
            handleCheckoutFailure(e);
            throw e;
        }
    }

    private void validateProductAvailability(CheckoutRequestDto request) {
        for (var item : request.getOrderItems()) {
            ProductEntity product = productService.getProductEntityById(item.getProductId());
            if (product == null) {
                throw new ResourceNotFoundException("Product not found: " + item.getProductId());
            }

            // If you have stock/inventory tracking
            // This is a basic implementation that can be enhanced
            if (product.getQuantity() != null && product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
        }
    }

    private void updateProductStock(CheckoutRequestDto request) {
        for (var item : request.getOrderItems()) {
            try {
                ProductEntity product = productService.getProductEntityById(item.getProductId());
                if (product.getQuantity() != null) {
                    product.setQuantity(product.getQuantity() - item.getQuantity());
                    productService.saveProduct(product);
                }
            } catch (Exception e) {
                log.error("Failed to update product stock for productId: {}", item.getProductId(), e);
                // Continue with other products even if one fails
            }
        }
    }

    private void sendOrderConfirmationEmail(OrderDto order, String username) {
        try {
            Map<String, Object> templateModel = new HashMap<>();
            templateModel.put("orderNumber", order.getOrderNumber());
            templateModel.put("orderDate", order.getOrderDate());
            templateModel.put("totalAmount", order.getTotalAmount());
            templateModel.put("items", order.getItems());

            emailService.sendOrderConfirmationEmail(username, "Order Confirmation", templateModel);
            log.info("Order confirmation email sent successfully for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email for order: {}", order.getOrderNumber(), e);
            // Don't fail the checkout if email sending fails
        }
    }

    private void handleCheckoutFailure(Exception error) {
        try {
            // Log the failure details
            log.error("Checkout failure: {}", error.getMessage());

            // Additional failure handling can be implemented here
            // For example, logging to a monitoring system, alerting admin, etc.
        } catch (Exception e) {
            log.error("Error in checkout failure handling", e);
        }
    }

    private OrderEntity convertToOrderEntity(OrderDto orderDto) {
        // You need to implement this based on your actual entity structure
        // For now, create a basic mapping
        OrderEntity entity = new OrderEntity();
        entity.setId(orderDto.getId());
        entity.setOrderNumber(orderDto.getOrderNumber());
        entity.setOrderDate(orderDto.getOrderDate());
        entity.setStatus(orderDto.getStatus());
        // Add other mappings as needed
        return entity;
    }

}