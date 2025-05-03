package com.ecspring.repositories;

import com.ecspring.entity.OrderEntity;
import com.ecspring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUser(UserEntity user);
    List<OrderEntity> findByStatus(String status);
    List<OrderEntity> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    Optional<OrderEntity> findByOrderNumber(String orderNumber);
    List<OrderEntity> findByUserOrderByOrderDateDesc(UserEntity user);
}
