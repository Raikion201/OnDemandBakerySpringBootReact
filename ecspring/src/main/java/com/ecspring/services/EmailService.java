package com.ecspring.services;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}
