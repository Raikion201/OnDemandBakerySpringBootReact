package com.ecspring.controllers;

import com.ecspring.dto.AuthResponseDto;
import com.ecspring.dto.CreateUserDto;
import com.ecspring.dto.RoleDto;
import com.ecspring.dto.SignInDto;
import com.ecspring.entity.RoleEntity;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.RoleService;
import com.ecspring.services.UserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final RoleService roleService;
    private final JwtUtil jwtUtil;

    public AdminController(
            AuthenticationManager authenticationManager,
            UserService userService,
            RoleService roleService,
            JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.roleService = roleService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody SignInDto signInDto, HttpServletResponse response) {
        Authentication authentication = null;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signInDto.getLoginID(), signInDto.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.error("Authentication error: {}", ex.getMessage());
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        if (authentication != null && authentication.isAuthenticated()) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Check if user has admin/staff/owner role
            boolean hasAdminRole = userDetails.getAuthorities().stream()
                    .anyMatch(authority -> 
                        authority.getAuthority().equals("ROLE_ADMIN") ||
                        authority.getAuthority().equals("ROLE_STAFF") ||
                        authority.getAuthority().equals("ROLE_OWNER"));
                        
            if (!hasAdminRole) {
                return ResponseEntity.status(403).body("Insufficient permissions");
            }
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            jwtUtil.generateAndSetJwtTokens(response, authentication);
            
            return ResponseEntity.ok(
                    new AuthResponseDto(userDetails.getName(), userDetails.getUsername(), userDetails.getEmail()));
        } else {
            return ResponseEntity.badRequest().body("Wrong password or username");
        }
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OWNER')")
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserDto createUserDto) {
        // Check if email is already registered
        if (userService.checkEmailExists(createUserDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Check if username is already registered
        if (userService.checkUsernameExists(createUserDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        try {
            userService.saveUserWithRoles(createUserDto);
            return ResponseEntity.ok("User created successfully");
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_STAFF')")
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoleDtos());
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OWNER')")
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OWNER')")
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        // In a real application, you would gather dashboard data here
        return ResponseEntity.ok("Admin dashboard data");
    }
}
