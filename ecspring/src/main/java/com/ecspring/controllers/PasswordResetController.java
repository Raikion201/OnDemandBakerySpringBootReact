package com.ecspring.controllers;

import com.ecspring.dto.ForgotPasswordRequest;
import com.ecspring.dto.ResetPasswordRequest;
import com.ecspring.services.impl.PasswordResetServiceImpl;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PasswordResetController {

    private final PasswordResetServiceImpl passwordResetService;

    public PasswordResetController(PasswordResetServiceImpl passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetPasswordEmail(request.getEmail());
        return ResponseEntity.ok("Password reset email has been sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully");
    }
}