package com.ecspring.services.impl;

import com.ecspring.dto.LineItemDto;
import com.ecspring.dto.OrderDto;
import com.ecspring.dto.CheckoutOrderItemDto;
import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.entity.*;
import com.ecspring.exception.ResourceNotFoundException;
import com.ecspring.repositories.*;
import com.ecspring.services.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final LineItemRepository lineItemRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;

    @Autowired
    public OrderServiceImpl(
            OrderRepository orderRepository,
            UserRepository userRepository,
            CartRepository cartRepository,
            LineItemRepository lineItemRepository,
            ProductRepository productRepository,
            InvoiceRepository invoiceRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.lineItemRepository = lineItemRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    @Transactional
    public OrderDto createOrderFromCart(Long userId) {
        // Find the user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Find the user's cart
        CartEntity cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user with id: " + userId));

        // Get cart items
        List<LineItemEntity> cartItems = lineItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot create order from an empty cart");
        }

        // Check if products are in stock
        for (LineItemEntity item : cartItems) {
            ProductEntity product = item.getProduct();
            if (product.getQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Not enough stock for product: " + product.getName());
            }
        }

        // Create new order
        OrderEntity order = new OrderEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setUser(user);
        order = orderRepository.save(order);

        // Create invoice
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setInvoiceNumber("INV-" + order.getOrderNumber());
        invoice.setDateCreated(LocalDateTime.now());
        invoice.setOrder(order);
        invoiceRepository.save(invoice);

        // Transfer items from cart to order and update product stock
        double totalAmount = 0.0;
        List<LineItemEntity> orderItems = new ArrayList<>();

        for (LineItemEntity cartItem : cartItems) {
            // Create new line item for order
            LineItemEntity orderItem = new LineItemEntity();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setOrder(order);
            orderItem = lineItemRepository.save(orderItem);
            orderItems.add(orderItem);

            // Update product stock
            ProductEntity product = cartItem.getProduct();
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Calculate item total and add to order total
            totalAmount += product.getPrice() * cartItem.getQuantity();
        }

        // Clear cart
        lineItemRepository.deleteAll(cartItems);

        // Build and return OrderDto
        return mapToOrderDto(order, orderItems, totalAmount);
    }

    @Override
    public OrderDto getOrderById(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        List<LineItemEntity> items = lineItemRepository.findByOrder(order);
        double totalAmount = calculateOrderTotal(items);

        return mapToOrderDto(order, items, totalAmount);
    }

    @Override
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        OrderEntity order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));

        List<LineItemEntity> items = lineItemRepository.findByOrder(order);
        double totalAmount = calculateOrderTotal(items);

        return mapToOrderDto(order, items, totalAmount);
    }

    @Override
    public List<OrderDto> getAllOrders() {
        List<OrderEntity> orders = orderRepository.findAll();
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<OrderEntity> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByUsername(String username) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with username: " + username);
        }

        List<OrderEntity> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByUserAndStatus(Long userId, String status) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<OrderEntity> orders = orderRepository.findByUserAndStatusOrderByOrderDateDesc(user, status);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByUsernameAndStatus(String username, String status) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with username: " + username);
        }

        List<OrderEntity> orders = orderRepository.findByUserAndStatusOrderByOrderDateDesc(user, status);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByStatus(String status) {
        List<OrderEntity> orders = orderRepository.findByStatus(status);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<OrderEntity> orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        return orders.stream()
                .map(order -> {
                    List<LineItemEntity> items = lineItemRepository.findByOrder(order);
                    double totalAmount = calculateOrderTotal(items);
                    return mapToOrderDto(order, items, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, String status) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(status);
        order = orderRepository.save(order);

        List<LineItemEntity> items = lineItemRepository.findByOrder(order);
        double totalAmount = calculateOrderTotal(items);

        return mapToOrderDto(order, items, totalAmount);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // First delete invoice if exists
        Optional<InvoiceEntity> invoice = invoiceRepository.findByOrder(order);
        invoice.ifPresent(invoiceRepository::delete);

        // Then delete order items
        List<LineItemEntity> items = lineItemRepository.findByOrder(order);
        lineItemRepository.deleteAll(items);

        // Finally delete the order
        orderRepository.delete(order);
    }

    @Override
    public String generateOrderNumber() {
        // Generate a unique order number based on timestamp and random UUID
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = now.format(formatter);
        String randomStr = UUID.randomUUID().toString().substring(0, 4);

        return "ORD-" + dateStr + "-" + randomStr;
    }

    @Override
    @Transactional
    public OrderDto createOrderFromRequest(String username, CheckoutRequestDto checkoutRequest) {
        // Find the user
        UserEntity user = userRepository.findByUsername(username);

        // Create new order
        OrderEntity order = new OrderEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setUser(user);
        order.setPaymentMethod(checkoutRequest.getPaymentMethod());
        order.setTotalAmount(checkoutRequest.getTotalAmount());

        // Set shipping information including name
        order.setShippingFirstName(checkoutRequest.getCustomerInfo().getFirstName());
        order.setShippingLastName(checkoutRequest.getCustomerInfo().getLastName());
        order.setShippingPhone(checkoutRequest.getCustomerInfo().getPhone());
        order.setShippingAddress(checkoutRequest.getCustomerInfo().getAddress());
        order.setShippingCity(checkoutRequest.getCustomerInfo().getCity());
        order.setShippingState(checkoutRequest.getCustomerInfo().getState());
        order.setShippingZipCode(checkoutRequest.getCustomerInfo().getZipCode());

        order = orderRepository.save(order);

        // Create invoice
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setInvoiceNumber("INV-" + order.getOrderNumber());
        invoice.setDateCreated(LocalDateTime.now());
        invoice.setOrder(order);
        invoiceRepository.save(invoice);

        List<LineItemEntity> orderItems = new ArrayList<>();

        // Process order items
        double totalAmount = 0.0;
        for (CheckoutOrderItemDto itemDto : checkoutRequest.getOrderItems()) {
            ProductEntity product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemDto.getProductId()));

            // Check if product is in stock
            if (product.getQuantity() < itemDto.getQuantity()) {
                throw new IllegalStateException("Not enough stock for product: " + product.getName());
            }

            // Create line item
            LineItemEntity orderItem = new LineItemEntity();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setOrder(order);
            orderItem = lineItemRepository.save(orderItem);
            orderItems.add(orderItem);

            // Update product stock
            product.setQuantity(product.getQuantity() - itemDto.getQuantity());
            productRepository.save(product);

            // Calculate item total
            totalAmount += product.getPrice() * itemDto.getQuantity();
        }

        // If not a direct purchase, clear cart
        if (!checkoutRequest.getDirectPurchase()) {
            CartEntity cart = cartRepository.findByUser(user).orElse(null);
            if (cart != null) {
                List<LineItemEntity> cartItems = lineItemRepository.findByCart(cart);
                lineItemRepository.deleteAll(cartItems);
            }
        }

        // Return order DTO with the correct number of arguments
        return mapToOrderDto(order, orderItems, totalAmount);
    }

    // Helper methods
    private OrderDto mapToOrderDto(OrderEntity order, List<LineItemEntity> items, double totalAmount) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setOrderNumber(order.getOrderNumber());
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setStatus(order.getStatus());
        orderDto.setUserId(order.getUser().getId());
        orderDto.setUserName(order.getUser().getName());
        orderDto.setTotalAmount(totalAmount);
        orderDto.setPaymentMethod(order.getPaymentMethod());

        // Map shipping information
        orderDto.setShippingFirstName(order.getShippingFirstName());
        orderDto.setShippingLastName(order.getShippingLastName());
        orderDto.setShippingPhone(order.getShippingPhone());
        orderDto.setShippingAddress(order.getShippingAddress());
        orderDto.setShippingCity(order.getShippingCity());
        orderDto.setShippingState(order.getShippingState());
        orderDto.setShippingZipCode(order.getShippingZipCode());

        List<LineItemDto> lineItemDtos = items.stream()
                .map(this::mapToLineItemDto)
                .collect(Collectors.toList());

        orderDto.setItems(lineItemDtos);

        return orderDto;
    }

    private LineItemDto mapToLineItemDto(LineItemEntity item) {
        LineItemDto lineItemDto = new LineItemDto();
        lineItemDto.setId(item.getId());
        lineItemDto.setQuantity(item.getQuantity());
        lineItemDto.setProductId(item.getProduct().getId());
        lineItemDto.setProductName(item.getProduct().getName());
        lineItemDto.setProductPrice(item.getProduct().getPrice());
        lineItemDto.setProductImageUrl(item.getProduct().getImageUrl());
        lineItemDto.setLineTotal(item.getProduct().getPrice() * item.getQuantity());

        return lineItemDto;
    }

    private double calculateOrderTotal(List<LineItemEntity> items) {
        return items.stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
    }

    @Override
    public OrderEntity getOrderEntityById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
}
