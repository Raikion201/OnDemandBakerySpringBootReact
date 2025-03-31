package com.ecspring.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotEmpty(message = "Email should not be empty")
    @Email(message = "Invalid email format")
    private String email;
}