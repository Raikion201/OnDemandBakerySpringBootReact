package com.ecspring.services.impl;

import com.ecspring.dto.CreateUserDto;
import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.UpdateProfileDto;
import com.ecspring.dto.UserProfileDto;
import com.ecspring.entity.RoleEntity;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.RoleRepository;
import com.ecspring.repositories.UserRepository;
import com.ecspring.services.RoleService;
import com.ecspring.services.UserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RoleService roleService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean checkUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    @Override
    public void saveUser(RegisterDto userDto) {
        UserEntity user = new UserEntity();
        user.setName(userDto.getName());
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        RoleEntity role = roleRepository.findByName("ROLE_USER");
        if (role == null) {
            role = new RoleEntity();
            role.setName("ROLE_USER");
            roleRepository.save(role);
        }

        user.setRoles(List.of(role));
        userRepository.save(user);
    }

    @Override
    public UserEntity findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public UserEntity findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<RegisterDto> findAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    private RegisterDto mapToUserDto(UserEntity user) {
        RegisterDto userDto = new RegisterDto();
        userDto.setName(user.getName());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        return userDto;
    }

    @Transactional
    @Override
    public void saveUserWithRoles(CreateUserDto createUserDto) {
        UserEntity user = new UserEntity();
        user.setName(createUserDto.getName());
        user.setEmail(createUserDto.getEmail());
        user.setUsername(createUserDto.getUsername());
        user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
        
        List<RoleEntity> roles = roleService.findRolesByNames(createUserDto.getRoles());
        user.setRoles(roles);
        userRepository.save(user);
    }

    @Override
    public List<UserEntity> findUsersByRole(String roleName) {
        RoleEntity role = roleRepository.findByName(roleName);
        if (role != null) {
            return role.getUsers();
        }
        return new ArrayList<>();
    }

    @Override
    public UserProfileDto getUserProfile(String username) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return new UserProfileDto(user.getUsername(), user.getName(), user.getEmail());
    }

    @Transactional
    @Override
    public UserProfileDto updateUserProfile(String username, UpdateProfileDto updateProfileDto) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(updateProfileDto.getEmail())) {
            if (userRepository.existsByEmail(updateProfileDto.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }

        user.setName(updateProfileDto.getName());
        user.setEmail(updateProfileDto.getEmail());
        userRepository.save(user);

        return new UserProfileDto(user.getUsername(), user.getName(), user.getEmail());
    }

    @Transactional
    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}