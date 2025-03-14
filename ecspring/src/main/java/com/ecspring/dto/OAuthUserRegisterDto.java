package com.ecspring.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OAuthUserRegisterDto {

    
    private String name;
    
    @Email
    private String email;

    
    // later implement OAuth2 provider and providerId
    // private String provider;
    
    // private String providerId;
    
    // Profile picture URL (if available)
    // private String pictureUrl;
}