package com.ecspring.services;

import com.ecspring.dto.RegisterDto;
import com.ecspring.entity.UserEntity;

import java.util.List;

public interface UserService {
    void saveUser(RegisterDto userDto);

    UserEntity findUserByEmail(String email);
    UserEntity findUserByUsername(String username);
    List<RegisterDto> findAllUsers();
    boolean checkUsernameExists(String username);
    boolean checkEmailExists(String email);
}