package com.ecspring.repositories;

import com.ecspring.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {
    List<ProductEntity> findByNameContainingIgnoreCase(String name);

    Page<ProductEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<ProductEntity> findByPriceBetween(Double minPrice, Double maxPrice);

    List<ProductEntity> findByQuantityGreaterThan(Integer quantity);

    Page<ProductEntity> findByQuantityGreaterThan(Integer quantity, Pageable pageable);
}
