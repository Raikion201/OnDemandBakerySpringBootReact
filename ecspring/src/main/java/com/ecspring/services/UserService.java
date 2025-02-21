package com.ecspring.services;

import com.ecspring.dto.UserDto;
import com.ecspring.entity.UserEntity;

import java.util.List;

public interface UserService {
    void saveUser(UserDto userDto);

    UserEntity findUserByEmail(String email);
    UserEntity findUserByUsername(String username);
    List<UserDto> findAllUsers();
    boolean checkUsernameExists(String username);
    boolean checkEmailExists(String email);
}