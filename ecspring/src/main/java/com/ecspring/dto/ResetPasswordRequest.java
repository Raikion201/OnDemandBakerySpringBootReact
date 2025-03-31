package com.ecspring.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotEmpty(message = "Token should not be empty")
    private String token;

    @NotEmpty(message = "New password should not be empty")
    private String newPassword;
}