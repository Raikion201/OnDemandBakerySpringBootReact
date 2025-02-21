package com.ecspring.controllers;

import com.ecspring.dto.AuthResponseDto;
import com.ecspring.dto.UserDto;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.UserService;
import com.ecspring.utils.JwtUtil;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    AuthenticationManager authenticationManager;

    private UserService userService;

    private JwtUtil jwtUtil;

    private PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDto userDto) {
        // Check if email is already registered
        if (userService.checkEmailExists(userDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Check if username is already registered
        if (userService.checkUsernameExists(userDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Save the new user
        userService.saveUser(userDto);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDto.getUsername(), userDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Generate tokens using the email as identifier
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        String accessToken = jwtUtil.generateJwtAccessToken(authentication);
        String refreshToken = jwtUtil.generateJwtRefreshToken(authentication);
        return ResponseEntity.ok(new AuthResponseDto(accessToken, refreshToken, userDetails.getId(),
                userDetails.getName(), userDetails.getUsername(), userDetails.getEmail(), roles));

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserDto userDto) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDto.getUsername(), userDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Generate tokens using the email as identifier
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        String accessToken = jwtUtil.generateJwtAccessToken(authentication);
        String refreshToken = jwtUtil.generateJwtRefreshToken(authentication);
        return ResponseEntity.ok(new AuthResponseDto(accessToken, refreshToken, userDetails.getId(),
                userDetails.getName(), userDetails.getUsername(), userDetails.getEmail(), roles));
    }
}