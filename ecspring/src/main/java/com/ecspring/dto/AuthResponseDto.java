package com.ecspring.dto;

import java.util.List;

import lombok.Data;

@Data
public class AuthResponseDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private List<String> roles;

    public AuthResponseDto(String name, String username, String email){
        this.name = name;
        this.username = username;
        this.email = email;
    }
}