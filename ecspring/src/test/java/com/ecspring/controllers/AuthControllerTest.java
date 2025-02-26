package com.ecspring.controllers;

import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.SignInDto;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
public class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    @Mock
    private HttpServletResponse response;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRegister() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setUsername("testuser");
        registerDto.setPassword("password");
        registerDto.setEmail("testuser@example.com");

        when(userService.checkEmailExists(registerDto.getEmail())).thenReturn(false);
        when(userService.checkUsernameExists(registerDto.getUsername())).thenReturn(false);
        doNothing().when(userService).saveUser(registerDto);

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getName()).thenReturn("Test User");
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userDetails.getEmail()).thenReturn("testuser@example.com");

        ResponseEntity<?> responseEntity = authController.register(registerDto, response);

        verify(jwtUtil, times(1)).generateAndSetJwtTokens(response, authentication);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    public void testLogin() {
        SignInDto signInDto = new SignInDto();
        signInDto.setLoginID("testuser");
        signInDto.setPassword("password");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getName()).thenReturn("Test User");
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userDetails.getEmail()).thenReturn("testuser@example.com");

        ResponseEntity<?> responseEntity = authController.login(signInDto, response);

        verify(jwtUtil, times(1)).generateAndSetJwtTokens(response, authentication);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    public void testRefresh() {
        Authentication authentication = mock(Authentication.class);
        when(SecurityContextHolder.getContext().getAuthentication()).thenReturn(authentication);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getName()).thenReturn("Test User");
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userDetails.getEmail()).thenReturn("testuser@example.com");

        ResponseEntity<?> responseEntity = authController.refresh(response);

        verify(jwtUtil, times(1)).generateAndSetJwtTokens(response, authentication);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }
}