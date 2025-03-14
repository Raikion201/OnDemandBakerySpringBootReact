package com.ecspring.services.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecspring.dto.OAuthUserRegisterDto;
import com.ecspring.entity.RoleEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.RoleRepository;
import com.ecspring.repositories.UserRepository;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.OAuthUserService;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class OAuthUserServiceImpl implements OAuthUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public OAuthUserServiceImpl(UserRepository userRepository,
            RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    @Override
    public Authentication processOAuthUser(OAuthUserRegisterDto oAuthUserRegisterDto) {
        UserEntity user = userRepository.findByEmail(oAuthUserRegisterDto.getEmail());

        if (user == null) {
            user = createNewOAuthUser(oAuthUserRegisterDto);
        }
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
        UserDetails userDetails = UserDetailsImpl.build(user);
        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                authorities);
    }

    @Override
    public UserEntity createNewOAuthUser(OAuthUserRegisterDto oAuthUserRegisterDto) {
        UserEntity user = mapToUserDto(oAuthUserRegisterDto);

        String username = generateUniqueUsername(oAuthUserRegisterDto.getEmail());
        user.setUsername(username);
        user.setPassword(UUID.randomUUID().toString());
        RoleEntity role = roleRepository.findByName("ROLE_USER");
        user.setRoles(Arrays.asList(role));
        return userRepository.save(user);
    }


    private UserEntity mapToUserDto(OAuthUserRegisterDto oAuthUserRegisterDto) {
        UserEntity user = new UserEntity();
        user.setName(oAuthUserRegisterDto.getName());
        user.setEmail(oAuthUserRegisterDto.getEmail());
        return user;
    }

    /**
     * Generates a unique username from email using Java streams
     * 
     * @param email The email address to derive the username from
     * @return A unique username
     */
    private String generateUniqueUsername(String email) {
        String baseUsername = email.substring(0, email.indexOf('@'))
                .replaceAll("[^a-zA-Z0-9]", "");

        return Stream.generate(() -> baseUsername + UUID.randomUUID().toString().substring(0, 3))
                .limit(100)
                .filter(username -> !userRepository.existsByUsername(username))
                .findFirst()
                .orElse(baseUsername + System.currentTimeMillis());
    }
}