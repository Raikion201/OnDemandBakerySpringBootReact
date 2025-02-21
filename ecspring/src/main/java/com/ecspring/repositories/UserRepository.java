package com.ecspring.repositories;


import com.ecspring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByEmail(String email);
    boolean existsByEmail(String email);
    UserEntity findByUsername(String username);
    boolean existsByUsername(String username);
}