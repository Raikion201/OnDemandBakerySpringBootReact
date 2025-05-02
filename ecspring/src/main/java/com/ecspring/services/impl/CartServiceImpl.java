package com.ecspring.services.impl;

import com.ecspring.dto.*;
import com.ecspring.entity.CartEntity;
import com.ecspring.entity.LineItemEntity;
import com.ecspring.entity.ProductEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.exception.ResourceNotFoundException;
import com.ecspring.repositories.CartRepository;
import com.ecspring.repositories.LineItemRepository;
import com.ecspring.repositories.ProductRepository;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final LineItemRepository lineItemRepository;

    @Autowired
    public CartServiceImpl(
            CartRepository cartRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            LineItemRepository lineItemRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.lineItemRepository = lineItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CartDto getUserCart(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Get or create cart for user
        CartEntity cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        // Get cart items
        List<LineItemEntity> cartItems = lineItemRepository.findByCart(cart);
        List<LineItemDto> lineItemDtos = cartItems.stream()
                .map(this::mapToLineItemDto)
                .collect(Collectors.toList());

        // Calculate total
        double total = lineItemDtos.stream()
                .mapToDouble(LineItemDto::getLineTotal)
                .sum();

        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId());
        cartDto.setUserId(userId);
        cartDto.setItems(lineItemDtos);
        cartDto.setTotal(total);
        cartDto.setItemCount(lineItemDtos.size());
        cartDto.setCartCookieId(UUID.randomUUID().toString()); // Generate a new cookie ID for the client

        return cartDto;
    }

    @Override
    @Transactional
    public CartDto syncCartFromCookies(Long userId, CartRequestDto cartRequest) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Get or create cart for user
        CartEntity cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        // Get existing cart items
        List<LineItemEntity> existingCartItems = lineItemRepository.findByCart(cart);
        Map<Long, LineItemEntity> existingItemsMap = existingCartItems.stream()
                .collect(Collectors.toMap(item -> item.getProduct().getId(), item -> item));

        // Process items from cookies
        List<LineItemEntity> itemsToSave = new ArrayList<>();
        List<Long> processedProductIds = new ArrayList<>();

        for (CartItemRequestDto itemRequest : cartRequest.getItems()) {
            Long productId = itemRequest.getProductId();
            Integer quantity = itemRequest.getQuantity();
            
            if (quantity <= 0) continue;
            
            processedProductIds.add(productId);
            
            ProductEntity product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            
            if (existingItemsMap.containsKey(productId)) {
                // Update existing item
                LineItemEntity existingItem = existingItemsMap.get(productId);
                existingItem.setQuantity(quantity);
                itemsToSave.add(existingItem);
            } else {
                // Create new item
                LineItemEntity newItem = new LineItemEntity();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                itemsToSave.add(newItem);
            }
        }

        // Remove items that are in the database but not in the cookie
        List<LineItemEntity> itemsToRemove = existingCartItems.stream()
                .filter(item -> !processedProductIds.contains(item.getProduct().getId()))
                .collect(Collectors.toList());
        
        if (!itemsToRemove.isEmpty()) {
            lineItemRepository.deleteAll(itemsToRemove);
        }
        
        // Save all updated and new items
        lineItemRepository.saveAll(itemsToSave);
        
        // Refresh cart items and build response
        List<LineItemEntity> updatedCartItems = lineItemRepository.findByCart(cart);
        List<LineItemDto> lineItemDtos = updatedCartItems.stream()
                .map(this::mapToLineItemDto)
                .collect(Collectors.toList());

        // Calculate total
        double total = lineItemDtos.stream()
                .mapToDouble(LineItemDto::getLineTotal)
                .sum();

        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId());
        cartDto.setUserId(userId);
        cartDto.setItems(lineItemDtos);
        cartDto.setTotal(total);
        cartDto.setItemCount(lineItemDtos.size());
        cartDto.setCartCookieId(cartRequest.getCartCookieId());

        return cartDto;
    }

    @Override
    public CartDto getAnonymousCart(CartRequestDto cartRequest) {
        List<LineItemDto> items = new ArrayList<>();
        double total = 0.0;
        
        for (CartItemRequestDto itemRequest : cartRequest.getItems()) {
            ProductEntity product = productRepository.findById(itemRequest.getProductId())
                    .orElse(null);
            
            if (product != null && itemRequest.getQuantity() > 0) {
                LineItemDto itemDto = new LineItemDto();
                itemDto.setProductId(product.getId());
                itemDto.setProductName(product.getName());
                itemDto.setProductPrice(product.getPrice());
                itemDto.setProductImageUrl(product.getImageUrl());
                itemDto.setQuantity(itemRequest.getQuantity());
                
                double lineTotal = product.getPrice() * itemRequest.getQuantity();
                itemDto.setLineTotal(lineTotal);
                total += lineTotal;
                
                items.add(itemDto);
            }
        }
        
        CartDto cartDto = new CartDto();
        cartDto.setItems(items);
        cartDto.setTotal(total);
        cartDto.setItemCount(items.size());
        cartDto.setCartCookieId(cartRequest.getCartCookieId() != null 
                ? cartRequest.getCartCookieId() 
                : UUID.randomUUID().toString());
        
        return cartDto;
    }

    @Override
    public boolean isProductInStock(Long productId, Integer quantity) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return product.getQuantity() >= quantity;
    }

    private LineItemDto mapToLineItemDto(LineItemEntity item) {
        LineItemDto dto = new LineItemDto();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setProductImageUrl(item.getProduct().getImageUrl());
        dto.setLineTotal(item.getProduct().getPrice() * item.getQuantity());
        return dto;
    }
}
