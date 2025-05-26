package com.ecspring.payment.impl;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.payment.PaymentStrategy;
import org.springframework.stereotype.Component;

@Component("cashOnDeliveryStrategy")
public class CashOnDeliveryStrategy implements PaymentStrategy {
    @Override
    public void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest) {
        // Logic đơn giản cho thanh toán khi nhận hàng
        order.setPaymentStatus("PENDING");
        // Không cần xử lý thêm cho hình thức COD
    }
    
    @Override
    public String getPaymentMethodName() {
        return "cash";
    }
    
    @Override
    public String getPaymentMethodDisplayName() {
        return "Thanh toán khi nhận hàng";
    }
    
    @Override
    public String getPaymentMethodDescription() {
        return "Thanh toán bằng tiền mặt khi đơn hàng được giao";
    }
}