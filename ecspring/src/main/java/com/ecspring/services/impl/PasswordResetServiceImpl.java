package com.ecspring.services.impl;

import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.PasswordResetTokenRepository;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.PasswordResetService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailServiceImpl emailService;

    public void sendResetPasswordEmail(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            // Log lỗi và không ném ngoại lệ
            System.out.println("User not found with email: " + email);
            return; // Không làm gì nếu email không tồn tại
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);

        // Lưu token vào cơ sở dữ liệu
        tokenRepository.savePasswordResetToken(user.getId(), token, expiryDate);

        // Gửi email
        emailService.sendPasswordResetEmail(email, token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        var resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        UserEntity user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update user's password
        user.setPassword(newPassword); // Hash password before saving
        userRepository.save(user);

        // Delete the token after successful reset
        tokenRepository.deleteByToken(token);
    }
}