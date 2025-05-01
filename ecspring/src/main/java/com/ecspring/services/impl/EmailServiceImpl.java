package com.ecspring.services.impl;

import com.ecspring.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("On-Demand Bakery - Password Reset");

        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String emailContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color: #4B5563;'>Reset Your Password</h2>" +
                "<p>Hello,</p>" +
                "<p>You are receiving this email because we received a password reset request for your account.</p>" +
                "<p>Please click the button below to reset your password:</p>" +
                "<a href='" + resetUrl
                + "' style='display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 15px 0;'>Reset Password</a>"
                +
                "<p>If you did not request a password reset, no further action is required.</p>" +
                "<p>This password reset link will expire in 30 minutes.</p>" +
                "<p>Regards,<br/>The On-Demand Bakery Team</p>" +
                "</div>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }
}