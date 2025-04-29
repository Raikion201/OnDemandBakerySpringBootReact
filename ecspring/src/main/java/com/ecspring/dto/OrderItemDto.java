package com.ecspring.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long id;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}