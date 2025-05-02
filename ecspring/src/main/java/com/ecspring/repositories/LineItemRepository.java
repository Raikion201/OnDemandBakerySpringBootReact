package com.ecspring.repositories;

import com.ecspring.entity.CartEntity;
import com.ecspring.entity.LineItemEntity;
import com.ecspring.entity.OrderEntity;
import com.ecspring.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LineItemRepository extends JpaRepository<LineItemEntity, Long> {
    List<LineItemEntity> findByOrder(OrderEntity order);
    List<LineItemEntity> findByCart(CartEntity cart);
    Optional<LineItemEntity> findByCartAndProduct(CartEntity cart, ProductEntity product);
}
