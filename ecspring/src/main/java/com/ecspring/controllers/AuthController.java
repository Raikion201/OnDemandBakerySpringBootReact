package com.ecspring.controllers;

import com.ecspring.dto.AuthResponseDto;
import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.SignInDto;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.UserService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

        private final AuthenticationManager authenticationManager;

        private final UserService userService;

        private final JwtUtil jwtUtil;

        public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil,
                        PasswordEncoder passwordEncoder) {
                this.authenticationManager = authenticationManager;
                this.userService = userService;
                this.jwtUtil = jwtUtil;
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto, HttpServletResponse response) {
                // Check if email is already registered
                if (userService.checkEmailExists(registerDto.getEmail())) {
                        return ResponseEntity.badRequest().body("Email already exists");
                }

                // Check if username is already registered
                if (userService.checkUsernameExists(registerDto.getUsername())) {
                        return ResponseEntity.badRequest().body("Username already exists");
                }

                // Save the new user
                userService.saveUser(registerDto);

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(registerDto.getUsername(),
                                                registerDto.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                // Generate tokens using the email as identifier
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                jwtUtil.generateAndSetJwtTokens(response, authentication);

                return ResponseEntity.ok(new AuthResponseDto(userDetails.getName(), userDetails.getUsername(),
                                userDetails.getEmail()));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody SignInDto signInDto, HttpServletResponse response) {
                Authentication authentication = null;
                try {
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(signInDto.getLoginID(),
                                                        signInDto.getPassword()));
                } catch (org.springframework.security.core.AuthenticationException ex) {
                        log.error("Authentication error: {}", ex.getMessage());
                }

                if (authentication != null && authentication.isAuthenticated()) {
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        jwtUtil.generateAndSetJwtTokens(response, authentication);
                        return ResponseEntity.ok(
                                        new AuthResponseDto(userDetails.getName(), userDetails.getUsername(),
                                                        userDetails.getEmail()));
                } else {
                        return ResponseEntity.badRequest().body("Wrong password or username");
                }
        }

        @PostMapping("/vo/refresh")
        public ResponseEntity<?> refresh(HttpServletResponse response) {
                // Get the current user
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                jwtUtil.generateAndSetJwtTokens(response, authentication);

                return ResponseEntity.ok(new AuthResponseDto(userDetails.getName(), userDetails.getUsername(),
                                userDetails.getEmail()));
        }

}