package com.ecspring.controllers;

import com.ecspring.dto.CartDto;
import com.ecspring.dto.CartRequestDto;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartController {

    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get user's cart - if authenticated, merge with any cookie cart
    @GetMapping
    public ResponseEntity<CartDto> getCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) CartRequestDto cookieCart) {
        try {
            // If user is authenticated, get their cart from DB or sync with cookie cart
            if (userDetails != null) {
                if (cookieCart != null && cookieCart.getItems() != null && !cookieCart.getItems().isEmpty()) {
                    // Sync cookie cart with user's database cart
                    CartDto updatedCart = cartService.syncCartFromCookies(userDetails.getId(), cookieCart);
                    return ResponseEntity.ok(updatedCart);
                } else {
                    // Just get the user's cart from the database
                    CartDto userCart = cartService.getUserCart(userDetails.getId());
                    return ResponseEntity.ok(userCart);
                }
            } 
            // For anonymous users, validate and return the cookie cart
            else if (cookieCart != null) {
                CartDto anonymousCart = cartService.getAnonymousCart(cookieCart);
                return ResponseEntity.ok(anonymousCart);
            } 
            // No user and no cookie cart
            else {
                // Return an empty cart with a new cookie ID
                CartRequestDto emptyRequest = new CartRequestDto();
                emptyRequest.setCartCookieId(null); // Service will generate a new ID
                CartDto emptyCart = cartService.getAnonymousCart(emptyRequest);
                return ResponseEntity.ok(emptyCart);
            }
        } catch (Exception e) {
            log.error("Error fetching cart: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Sync cart from cookies (POST version for more complex requests)
    @PostMapping("/sync")
    public ResponseEntity<CartDto> syncCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CartRequestDto cookieCart) {
        try {
            if (userDetails != null) {
                // Sync cookie cart with user's database cart
                CartDto updatedCart = cartService.syncCartFromCookies(userDetails.getId(), cookieCart);
                return ResponseEntity.ok(updatedCart);
            } else {
                // For anonymous users, validate and return the cookie cart
                CartDto anonymousCart = cartService.getAnonymousCart(cookieCart);
                return ResponseEntity.ok(anonymousCart);
            }
        } catch (Exception e) {
            log.error("Error syncing cart: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
