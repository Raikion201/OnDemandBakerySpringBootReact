package com.ecspring.services;

import com.ecspring.dto.CartDto;
import com.ecspring.dto.CartRequestDto;

public interface CartService {
    CartDto getUserCart(Long userId);
    boolean isProductInStock(Long productId, Integer quantity);
    CartDto syncCartFromCookies(Long userId, CartRequestDto cartRequest);
    CartDto getAnonymousCart(CartRequestDto cartRequest);
}
