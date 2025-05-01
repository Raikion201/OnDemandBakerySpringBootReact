package com.ecspring.services.impl;

import com.ecspring.dto.ForgotPasswordRequestDto;
import com.ecspring.dto.ResetPasswordRequestDto;
import com.ecspring.entity.PasswordResetTokenEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.PasswordResetTokenRepository;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.EmailService;
import com.ecspring.services.PasswordResetService;
import jakarta.mail.MessagingException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Token expiration time in minutes
    private static final int TOKEN_EXPIRATION_MINUTES = 30;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void createPasswordResetTokenForEmail(ForgotPasswordRequestDto requestDto) throws MessagingException {
        UserEntity user = userRepository.findByEmail(requestDto.getEmail());

        if (user != null) {
            // Remove any existing token for this user
            tokenRepository.deleteByUser(user);

            // Create new token
            String token = UUID.randomUUID().toString();
            PasswordResetTokenEntity resetToken = new PasswordResetTokenEntity();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiryDate(Instant.now().plusSeconds(TOKEN_EXPIRATION_MINUTES * 60));

            tokenRepository.save(resetToken);

            // Send email with reset link
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        }
        // Note: We don't reveal whether the email exists for security reasons
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        Optional<PasswordResetTokenEntity> resetToken = tokenRepository.findByToken(token);

        return resetToken.map(tokenEntity -> {
            Instant now = Instant.now();
            return !now.isAfter(tokenEntity.getExpiryDate());
        }).orElse(false);
    }

    @Override
    @Transactional
    public boolean resetPassword(ResetPasswordRequestDto resetRequest) {
        Optional<PasswordResetTokenEntity> resetToken = tokenRepository.findByToken(resetRequest.getToken());

        return resetToken.map(tokenEntity -> {
            // Check if token is expired
            if (Instant.now().isAfter(tokenEntity.getExpiryDate())) {
                return false;
            }

            // Update password
            UserEntity user = tokenEntity.getUser();
            user.setPassword(passwordEncoder.encode(resetRequest.getPassword()));
            userRepository.save(user);

            // Delete the used token
            tokenRepository.delete(tokenEntity);

            return true;
        }).orElse(false);
    }
}