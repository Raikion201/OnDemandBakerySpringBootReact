package com.ecspring.services;

import com.ecspring.dto.RegisterDto;
import com.ecspring.entity.UserEntity;

import java.util.List;

public interface PasswordResetService {

    void sendResetPasswordEmail(String email);

    void resetPassword(String token, String newPassword);

}
