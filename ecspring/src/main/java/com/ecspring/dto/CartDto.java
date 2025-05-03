package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    private List<LineItemDto> items = new ArrayList<>();
    private Double total;
    private Integer itemCount;
    private String cartCookieId; // Added for cookie tracking
}
