package com.ecspring.repositories;

import com.ecspring.entity.OrderEntity;
import com.ecspring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserOrderByOrderDateDesc(UserEntity user);
}