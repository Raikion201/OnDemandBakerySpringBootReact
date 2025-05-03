package com.ecspring.services;

import com.ecspring.entity.ProductEntity;
import com.ecspring.dto.ProductFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<ProductEntity> getAllProducts();

    Optional<ProductEntity> getProductById(Long id);

    List<ProductEntity> searchProductsByName(String name);

    List<ProductEntity> getProductsByPriceRange(Double minPrice, Double maxPrice);

    List<ProductEntity> getProductsInStock();

    ProductEntity createProduct(ProductEntity product);

    ProductEntity updateProduct(Long id, ProductEntity productDetails);

    void deleteProduct(Long id);

    ProductEntity uploadProductImage(Long id, MultipartFile file);

    Page<ProductEntity> filterProducts(ProductFilterDto filterDto, Pageable pageable);
}
