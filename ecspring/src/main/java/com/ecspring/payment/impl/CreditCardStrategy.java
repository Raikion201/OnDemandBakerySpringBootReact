package com.ecspring.payment.impl;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.payment.PaymentStrategy;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("creditCardStrategy")
public class CreditCardStrategy implements PaymentStrategy {
    @Override
    public void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest) {
        // Trong thực tế, tại đây sẽ tích hợp với cổng thanh toán
        // Hiện tại, chỉ đánh dấu đơn hàng đã thanh toán
        order.setPaymentStatus("PAID");
        
        // Xử lý thông tin thẻ từ paymentDetails nếu có
        Map<String, Object> paymentDetails = checkoutRequest.getPaymentDetails();
        if (paymentDetails != null && !paymentDetails.isEmpty()) {
            // Lưu lại 4 số cuối của thẻ để tham chiếu
            String cardNumber = (String) paymentDetails.get("cardNumber");
            if (cardNumber != null && cardNumber.length() >= 4) {
                String lastFourDigits = cardNumber.substring(cardNumber.length() - 4);
                order.setPaymentReference("XXXX-XXXX-XXXX-" + lastFourDigits);
            }
        }
    }
    
    @Override
    public String getPaymentMethodName() {
        return "credit_card";
    }
    
    @Override
    public String getPaymentMethodDisplayName() {
        return "Thẻ tín dụng/ghi nợ";
    }
    
    @Override
    public String getPaymentMethodDescription() {
        return "Thanh toán an toàn bằng thẻ tín dụng hoặc ghi nợ";
    }
}