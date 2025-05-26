package com.ecspring.payment;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.entity.OrderEntity;

public interface PaymentStrategy {
    void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest);

    String getPaymentMethodName();

    String getPaymentMethodDisplayName();

    String getPaymentMethodDescription();
}