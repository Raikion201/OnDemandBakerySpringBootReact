package com.ecspring.dto;

import java.util.List;

import lombok.Data;

@Data
public class AuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private Long id;
    private String name;
    private String username;
    private String email;
    private List<String> roles;

    public AuthResponseDto(String accessToken, String refreshToken, Long id, String name, String username,
            String email, List<String> roles) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }


}