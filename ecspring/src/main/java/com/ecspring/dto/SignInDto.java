package com.ecspring.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class SignInDto {
    @NotEmpty(message = "Username or email should not be empty")
    private String loginID;
    @NotEmpty(message = "Password should not be empty")
    private String password;
}
