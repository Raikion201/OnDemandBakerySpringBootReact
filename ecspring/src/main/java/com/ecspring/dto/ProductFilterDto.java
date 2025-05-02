package com.ecspring.dto;

import lombok.Data;

@Data
public class ProductFilterDto {
    private String name;
    private Double minPrice;
    private Double maxPrice;
    private Boolean inStock;
    private String sortBy;
    private String sortDirection;
}