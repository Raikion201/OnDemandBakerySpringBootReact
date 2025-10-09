package com.ecspring.controllers;

import com.ecspring.dto.AuthResponseDto;
import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.SignInDto;
import com.ecspring.dto.ForgotPasswordRequestDto;
import com.ecspring.dto.ResetPasswordRequestDto;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.UserService;
import com.ecspring.services.PasswordResetService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.mail.MessagingException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

        private final AuthenticationManager authenticationManager;

        private final UserService userService;

        private final JwtUtil jwtUtil;

        private final UserDetailsService UserDetailsService;

        private final PasswordResetService passwordResetService;

        public AuthController(AuthenticationManager authenticationManager,
                        UserService userService,
                        JwtUtil jwtUtil,
                        PasswordEncoder passwordEncoder,
                        UserDetailsService UserDetailsService,
                        PasswordResetService passwordResetService) {
                this.authenticationManager = authenticationManager;
                this.userService = userService;
                this.jwtUtil = jwtUtil;
                this.UserDetailsService = UserDetailsService;
                this.passwordResetService = passwordResetService;
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

                Authentication authentication = null;
                try {
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(registerDto.getUsername(),
                                                        registerDto.getPassword()));
                } catch (org.springframework.security.core.AuthenticationException ex) {
                        log.error("Authentication error: {}", ex.getMessage());
                }

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
                        if (refreshToken == null || !jwtUtil.validateJwtToken(refreshToken)
                                        || jwtUtil.isTokenExpired(refreshToken)) {
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token is expired");
                        }
                        // Extract username or email from refresh token
                        String username = jwtUtil.getUsernameFromToken(refreshToken);
                        if (username == null || username.isEmpty()) {
                                username = jwtUtil.getEmailFromToken(refreshToken);
                        }

                        // Load full user details with authorities from the database
                        UserDetailsImpl userDetails = (UserDetailsImpl) UserDetailsService.loadUserByUsername(username);

                        // Create new authentication object with proper authorities
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());

                        // Set authentication in context
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // Generate new token pair
                        jwtUtil.generateAndSetJwtTokens(response, authentication);

                        // Return user info with the response
                        return ResponseEntity.ok(
                                        new AuthResponseDto(userDetails.getName(), userDetails.getUsername(),
                                                        userDetails.getEmail()));
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

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto requestDto) {
                try {
                        passwordResetService.createPasswordResetTokenForEmail(requestDto);
                        return ResponseEntity.ok(
                                        "If your email is registered, you will receive password reset instructions.");
                } catch (MessagingException e) {
                        log.error("Error sending password reset email: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to send password reset email. Please try again.");
                }
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
                if (userDetails != null) {
                        // Return user information with roles
                        AuthResponseDto response = new AuthResponseDto(
                                userDetails.getName(),
                                userDetails.getUsername(),
                                userDetails.getEmail());
                        
                        // Add roles to the response
                        List<String> roles = userDetails.getAuthorities().stream()
                                .map(authority -> authority.getAuthority())
                                .collect(Collectors.toList());
                        
                        Map<String, Object> responseWithRoles = new HashMap<>();
                        responseWithRoles.put("name", response.getName());
                        responseWithRoles.put("username", response.getUsername());
                        responseWithRoles.put("email", response.getEmail());
                        responseWithRoles.put("roles", roles);
                        
                        return ResponseEntity.ok(responseWithRoles);
                } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
                }
        }

        @PostMapping("/validate-reset-token")
        public ResponseEntity<?> validateResetToken(@RequestParam("token") String token) {
                boolean isValid = passwordResetService.validatePasswordResetToken(token);
                if (isValid) {
                        return ResponseEntity.ok("Token is valid");
                } else {
                        return ResponseEntity.badRequest().body("Invalid or expired token");
                }
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDto resetRequest) {
                boolean success = passwordResetService.resetPassword(resetRequest);
                if (success) {
                        return ResponseEntity.ok("Password has been reset successfully");
                } else {
                        return ResponseEntity.badRequest().body("Invalid or expired token");
                }
        }

}