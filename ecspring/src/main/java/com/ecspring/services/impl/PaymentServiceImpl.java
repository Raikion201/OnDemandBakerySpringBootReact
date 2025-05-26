package com.ecspring.services.impl;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.dto.PaymentMethodDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.services.PaymentService;
import com.ecspring.payment.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;

@Slf4j
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentProcessor paymentProcessor;

    @Autowired
    public PaymentServiceImpl(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    @Override
    public List<PaymentMethodDto> getAvailablePaymentMethods() {
        return paymentProcessor.getAvailablePaymentMethods();
    }

    @Override
    public void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest) {
        log.info("Processing payment for order {} with method {}",
                order.getOrderNumber(),
                checkoutRequest.getPaymentMethod());
        paymentProcessor.processPayment(order, checkoutRequest);
    }

    @Override
    public boolean validatePaymentMethod(String method) {
        return Arrays.asList("cash", "credit_card", "bank_transfer").contains(method);
    }
}