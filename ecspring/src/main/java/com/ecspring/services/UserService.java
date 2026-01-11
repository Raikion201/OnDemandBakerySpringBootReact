package com.ecspring.services;

import com.ecspring.dto.CreateUserDto;
import com.ecspring.dto.RegisterDto;
import com.ecspring.dto.UpdateProfileDto;
import com.ecspring.dto.UserProfileDto;
import com.ecspring.entity.RoleEntity;
import com.ecspring.entity.UserEntity;

import java.util.List;

public interface UserService {
    // Existing methods
    void saveUser(RegisterDto userDto);
    UserEntity findUserByEmail(String email);
    UserEntity findUserByUsername(String username);
    List<RegisterDto> findAllUsers();
    boolean checkUsernameExists(String username);
    boolean checkEmailExists(String email);
    
    // Modified methods
    void saveUserWithRoles(CreateUserDto createUserDto);
    List<UserEntity> findUsersByRole(String roleName);
    
    // Profile management methods
    UserProfileDto getUserProfile(String username);
    UserProfileDto updateUserProfile(String username, UpdateProfileDto updateProfileDto);
    void changePassword(String username, String currentPassword, String newPassword);
}