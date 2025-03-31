package com.ecspring.repositories;

import com.ecspring.entity.PasswordResetToken;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    PasswordResetToken findByToken(String token);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO password_reset_tokens (user_id, token, expiry_date) VALUES (?1, ?2, ?3)", nativeQuery = true)
    void savePasswordResetToken(Long userId, String token, LocalDateTime expiryDate);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM password_reset_tokens WHERE token = ?1", nativeQuery = true)
    void deleteByToken(String token);
}