package com.ecspring.repositories;

import com.ecspring.entity.PasswordResetTokenEntity;
import com.ecspring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {
    Optional<PasswordResetTokenEntity> findByToken(String token);

    void deleteByUser(UserEntity user);
}