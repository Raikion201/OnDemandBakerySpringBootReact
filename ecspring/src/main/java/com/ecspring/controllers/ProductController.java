package com.ecspring.controllers;

import com.ecspring.entity.ProductEntity;
import com.ecspring.exception.ResourceNotFoundException;
import com.ecspring.exception.StorageFileNotFoundException;
import com.ecspring.services.ProductService;
import com.ecspring.services.StorageService;
import com.ecspring.dto.ProductDto;
import com.ecspring.dto.ProductFilterDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;
    private final StorageService storageService;

    @Autowired
    public ProductController(ProductService productService, StorageService storageService) {
        this.productService = productService;
        this.storageService = storageService;
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<ProductEntity>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Get products in stock
    @GetMapping("/in-stock")
    public ResponseEntity<List<ProductEntity>> getProductsInStock() {
        return ResponseEntity.ok(productService.getProductsInStock());
    }

    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<List<ProductEntity>> searchProducts(@RequestParam String name) {
        return ResponseEntity.ok(productService.searchProductsByName(name));
    }

    // Get products by price range
    @GetMapping("/price-range")
    public ResponseEntity<List<ProductEntity>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    // Get product by id
    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new product
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<ProductEntity> createProduct(@RequestBody ProductEntity product) {
        ProductEntity newProduct = productService.createProduct(product);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    // Update a product
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<ProductEntity> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductEntity productDetails) {
        try {
            ProductEntity updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a product
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<Map<String, Boolean>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Upload product image
    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            ProductEntity product = productService.uploadProductImage(id, file);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", product.getImageUrl());
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Serve product image
    @GetMapping("/images/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveProductImage(@PathVariable String filename) {
        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(file);
    }

    // Advanced product filtering with pagination
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductDto>> filterProducts(
            @ModelAttribute ProductFilterDto filterDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {

        // Set sort parameters from request
        filterDto.setSortBy(sort);
        filterDto.setSortDirection(direction);

        // Create pageable object
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        // Get filtered products
        Page<ProductEntity> productPage = productService.filterProducts(filterDto, pageable);

        // Convert to DTOs
        Page<ProductDto> productDtoPage = productPage.map(this::convertToDto);

        return ResponseEntity.ok(productDtoPage);
    }

    // Helper method to convert entity to DTO
    private ProductDto convertToDto(ProductEntity product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setImageUrl(product.getImageUrl());

        // Change this line to use stock instead of quantity if needed
        dto.setInStock(product.getQuantity() > 0);

        // Calculate average rating if feedbacks exist
        if (product.getFeedbacks() != null && !product.getFeedbacks().isEmpty()) {
            double avgRating = product.getFeedbacks().stream()
                    .mapToInt(feedback -> feedback.getStar())
                    .average()
                    .orElse(0.0);
            dto.setAvgRating(avgRating);
        } else {
            dto.setAvgRating(0.0);
        }

        return dto;
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }
}
