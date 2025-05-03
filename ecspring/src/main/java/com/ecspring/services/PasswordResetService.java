package com.ecspring.services;

import com.ecspring.dto.ForgotPasswordRequestDto;
import com.ecspring.dto.ResetPasswordRequestDto;
import jakarta.mail.MessagingException;

public interface PasswordResetService {
    void createPasswordResetTokenForEmail(ForgotPasswordRequestDto requestDto) throws MessagingException;
    boolean validatePasswordResetToken(String token);
    boolean resetPassword(ResetPasswordRequestDto resetRequest);
}