package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartRequestDto {
    private String cartCookieId;
    private List<CartItemRequestDto> items = new ArrayList<>();
}
