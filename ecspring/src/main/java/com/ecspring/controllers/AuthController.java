package com.ecspring.controllers;

import com.ecspring.dto.AuthResponseDto;
import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.SignInDto;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
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

        private final UserDetailsService UserDetailsService;

        public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil,
                        PasswordEncoder passwordEncoder, UserDetailsService UserDetailsService) {
                this.authenticationManager = authenticationManager;
                this.userService = userService;
                this.jwtUtil = jwtUtil;
                this.UserDetailsService = UserDetailsService;
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

        @PostMapping("/refresh")
        public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
                try {
                        // Parse refresh token from request cookies
                        String refreshToken = jwtUtil.parseRefreshJwtFromCookie(request);

                        if (refreshToken == null) {
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No refresh token");
                        }

                        // Validate refresh token
                        if (!jwtUtil.validateJwtToken(refreshToken)) {
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token invalid");
                        }
                        //
                        // // Extract user details from refresh token and create new authentication
                        String username = jwtUtil.getUsernameFromToken(refreshToken);
                        if (username.isEmpty()) {
                                username = jwtUtil.getEmailFromToken(refreshToken);
                        }
                        //
                        // Load user details
                        UserDetailsImpl userDetails = (UserDetailsImpl) UserDetailsService.loadUserByUsername(username);

                        // Create new authentication object
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());

                        // Set authentication in context
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // Generate new tokens
                        jwtUtil.generateAndSetJwtTokens(response, authentication);
                        return ResponseEntity.ok().build();

                } catch (Exception e) {
                        log.error("Failed to refresh token: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to refresh token");
                }
        }

        @PostMapping("/removeAccess")
        public ResponseEntity<?> removeAccess(HttpServletResponse response) {
                // Passing null to refresh token is not doing anything with it
                jwtUtil.setJwtCookies(response, null, null);

                return ResponseEntity.ok().body("Access token removed");
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response) {
                // Remove access token cookie by passing "" as the value
                jwtUtil.setJwtCookies(response, null, "");

                // Clear security context
                SecurityContextHolder.clearContext();

                return ResponseEntity.ok().body("Logged out successfully");
        }

}