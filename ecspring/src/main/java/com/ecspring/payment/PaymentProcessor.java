package com.ecspring.payment;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.dto.PaymentMethodDto;
import com.ecspring.entity.OrderEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentProcessor {
    private final Map<String, PaymentStrategy> paymentStrategies = new HashMap<>();

    @Autowired
    public PaymentProcessor(List<PaymentStrategy> strategies) {
        strategies.forEach(strategy -> paymentStrategies.put(strategy.getPaymentMethodName(), strategy));
    }

    public void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest) {
        String paymentMethod = checkoutRequest.getPaymentMethod();
        PaymentStrategy strategy = paymentStrategies.get(paymentMethod);

        if (strategy == null) {
            throw new IllegalArgumentException("Phương thức thanh toán không được hỗ trợ: " + paymentMethod);
        }

        strategy.processPayment(order, checkoutRequest);
    }

    public List<PaymentMethodDto> getAvailablePaymentMethods() {
        return paymentStrategies.values().stream()
                .map(strategy -> new PaymentMethodDto(
                        strategy.getPaymentMethodName(),
                        strategy.getPaymentMethodDisplayName(),
                        strategy.getPaymentMethodDescription(), false))
                .collect(Collectors.toList());
    }

    public void setPaymentStrategy(PaymentStrategy strategy) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setPaymentStrategy'");
    }
}