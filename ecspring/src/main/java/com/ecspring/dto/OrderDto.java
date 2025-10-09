package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private LocalDateTime orderDate;
    private String status;
    private Long userId;
    private String userName;
    private List<LineItemDto> items = new ArrayList<>();
    private Double totalAmount;
    private String paymentMethod;
    
    // Update shipping information to include name
    private String shippingFirstName;
    private String shippingLastName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;

}
