package com.ecspring.services;

import jakarta.mail.MessagingException;
import java.util.Map;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token) throws MessagingException;

    void sendOrderConfirmationEmail(String to, String subject, Map<String, Object> templateModel)
            throws MessagingException;
}