package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineItemDto {
    private Long id;
    private Integer quantity;
    private Long productId;
    private String productName;
    private Double productPrice;
    private String productImageUrl;
    private Double lineTotal;
}
