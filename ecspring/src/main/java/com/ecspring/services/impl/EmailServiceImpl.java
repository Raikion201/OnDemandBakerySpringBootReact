package com.ecspring.services.impl;

import com.ecspring.services.EmailService;
import com.ecspring.dto.LineItemDto;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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

    @Override
    public void sendOrderConfirmationEmail(String to, String subject, Map<String, Object> templateModel)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("On-Demand Bakery - " + subject);

        String emailContent = buildOrderConfirmationContent(templateModel);
        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    private String buildOrderConfirmationContent(Map<String, Object> templateModel) {
        String orderNumber = (String) templateModel.get("orderNumber");
        LocalDateTime orderDate = (LocalDateTime) templateModel.get("orderDate");
        Double totalAmount = (Double) templateModel.get("totalAmount");
        @SuppressWarnings("unchecked")
        List<LineItemDto> items = (List<LineItemDto>) templateModel.get("items");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = orderDate != null ? orderDate.format(formatter) : "N/A";

        StringBuilder content = new StringBuilder();
        content.append(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");

        // Header
        content.append(
                "<div style='text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px;'>");
        content.append("<h1 style='color: #4F46E5; margin: 0;'>On-Demand Bakery</h1>");
        content.append("<h2 style='color: #4B5563; margin: 10px 0 0 0;'>Order Confirmation</h2>");
        content.append("</div>");

        // Order Info
        content.append(
                "<div style='background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;'>");
        content.append("<h3 style='color: #4B5563; margin-top: 0;'>Order Details</h3>");
        content.append("<p><strong>Order Number:</strong> ").append(orderNumber != null ? orderNumber : "N/A")
                .append("</p>");
        content.append("<p><strong>Order Date:</strong> ").append(formattedDate).append("</p>");
        content.append("<p><strong>Total Amount:</strong> $")
                .append(String.format("%.2f", totalAmount != null ? totalAmount : 0.0)).append("</p>");
        content.append("</div>");

        // Order Items
        if (items != null && !items.isEmpty()) {
            content.append("<div style='margin-bottom: 30px;'>");
            content.append("<h3 style='color: #4B5563;'>Items Ordered</h3>");
            content.append("<table style='width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB;'>");
            content.append("<thead>");
            content.append("<tr style='background-color: #F9FAFB;'>");
            content.append(
                    "<th style='padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB;'>Product</th>");
            content.append(
                    "<th style='padding: 12px; text-align: center; border-bottom: 1px solid #E5E7EB;'>Quantity</th>");
            content.append(
                    "<th style='padding: 12px; text-align: right; border-bottom: 1px solid #E5E7EB;'>Price</th>");
            content.append(
                    "<th style='padding: 12px; text-align: right; border-bottom: 1px solid #E5E7EB;'>Total</th>");
            content.append("</tr>");
            content.append("</thead>");
            content.append("<tbody>");

            for (LineItemDto item : items) {
                content.append("<tr>");
                content.append("<td style='padding: 12px; border-bottom: 1px solid #E5E7EB;'>")
                        .append(item.getProductName() != null ? item.getProductName() : "N/A")
                        .append("</td>");
                content.append("<td style='padding: 12px; text-align: center; border-bottom: 1px solid #E5E7EB;'>")
                        .append(item.getQuantity() != null ? item.getQuantity() : 0)
                        .append("</td>");
                content.append("</tr>");
            }

            content.append("</tbody>");
            content.append("</table>");
            content.append("</div>");
        }

        // Order Tracking
        content.append(
                "<div style='background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 30px;'>");
        content.append("<h3 style='color: #1E40AF; margin-top: 0;'>What's Next?</h3>");
        content.append("<p>Your order is being processed and you'll receive updates as it progresses.</p>");
        content.append("<p>You can track your order status by visiting:</p>");
        content.append("<a href='").append(frontendUrl).append(
                "/orders' style='display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;'>Track Your Order</a>");
        content.append("</div>");

        // Footer
        content.append(
                "<div style='text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; color: #6B7280;'>");
        content.append("<p>Thank you for choosing On-Demand Bakery!</p>");
        content.append("<p>If you have any questions, please contact us at support@ondemandbakery.com</p>");
        content.append(
                "<p style='font-size: 12px;'>This is an automated message, please do not reply to this email.</p>");
        content.append("</div>");

        content.append("</div>");

        return content.toString();
    }
}