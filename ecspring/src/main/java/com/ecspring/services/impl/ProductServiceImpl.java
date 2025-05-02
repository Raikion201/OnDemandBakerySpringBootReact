package com.ecspring.services.impl;

import com.ecspring.entity.ProductEntity;
import com.ecspring.exception.ResourceNotFoundException;
import com.ecspring.repositories.ProductRepository;
import com.ecspring.services.ProductService;
import com.ecspring.services.StorageService;
import com.ecspring.dto.ProductFilterDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StorageService storageService;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository, StorageService storageService) {
        this.productRepository = productRepository;
        this.storageService = storageService;
    }

    @Override
    public List<ProductEntity> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Optional<ProductEntity> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public List<ProductEntity> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public List<ProductEntity> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    @Override
    public List<ProductEntity> getProductsInStock() {
        return productRepository.findByQuantityGreaterThan(0);
    }

    @Override
    @Transactional
    public ProductEntity createProduct(ProductEntity product) {
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductEntity updateProduct(Long id, ProductEntity productDetails) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Delete product image if exists
        if (product.getImageName() != null && !product.getImageName().isEmpty()) {
            storageService.deleteFile(product.getImageName());
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductEntity uploadProductImage(Long id, MultipartFile file) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Delete old image if exists
        if (product.getImageName() != null && !product.getImageName().isEmpty()) {
            storageService.deleteFile(product.getImageName());
        }

        // Store new image
        String filename = storageService.store(file);

        // Create URL path for the stored file (accessible via web)
        String fileUrl = "/uploads/products/" + filename;

        // Update product with image information
        product.setImageName(filename);
        product.setImageUrl(fileUrl);

        return productRepository.save(product);
    }

    @Override
    public Page<ProductEntity> filterProducts(ProductFilterDto filterDto, Pageable pageable) {
        Specification<ProductEntity> spec = Specification.where(null);

        // Lọc theo tên nếu được cung cấp
        if (filterDto.getName() != null && !filterDto.getName().isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + filterDto.getName().toLowerCase() + "%"));
        }

        // Lọc theo khoảng giá nếu được cung cấp
        if (filterDto.getMinPrice() != null) {
            spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(root.get("price"),
                    filterDto.getMinPrice()));
        }

        if (filterDto.getMaxPrice() != null) {
            spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(root.get("price"),
                    filterDto.getMaxPrice()));
        }

        // Lọc theo trạng thái tồn kho nếu được cung cấp
        if (filterDto.getInStock() != null && filterDto.getInStock()) {
            spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.greaterThan(root.get("quantity"), 0));
        }

        return productRepository.findAll(spec, pageable);
    }
}
