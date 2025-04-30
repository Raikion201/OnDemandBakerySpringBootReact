package com.ecspring.repositories;

import com.ecspring.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    List<ProductEntity> findByNameContainingIgnoreCase(String name);
    
    List<ProductEntity> findByPriceBetween(Double minPrice, Double maxPrice);
    
    List<ProductEntity> findByQuantityGreaterThan(Integer quantity);
}
