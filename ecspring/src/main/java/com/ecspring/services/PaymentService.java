package com.ecspring.services;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.dto.PaymentMethodDto;
import com.ecspring.entity.OrderEntity;
import java.util.List;

public interface PaymentService {
    List<PaymentMethodDto> getAvailablePaymentMethods();
    void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest);
    boolean validatePaymentMethod(String paymentMethod);
}