package com.ecspring.services;

public interface PasswordResetService {

    void sendResetPasswordEmail(String email);

    void resetPassword(String token, String newPassword);

}
