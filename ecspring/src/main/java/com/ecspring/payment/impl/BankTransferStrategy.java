package com.ecspring.payment.impl;

import com.ecspring.dto.CheckoutRequestDto;
import com.ecspring.entity.OrderEntity;
import com.ecspring.payment.PaymentStrategy;
import org.springframework.stereotype.Component;

@Component("bankTransferStrategy")
public class BankTransferStrategy implements PaymentStrategy {
    @Override
    public void processPayment(OrderEntity order, CheckoutRequestDto checkoutRequest) {
        // Đơn hàng sẽ ở trạng thái chờ cho đến khi xác nhận chuyển khoản
        order.setPaymentStatus("PENDING");

        // Tạo mã tham chiếu cho việc chuyển khoản
        String referenceCode = "BT-" + order.getOrderNumber();
        order.setPaymentReference(referenceCode);
    }

    @Override
    public String getPaymentMethodName() {
        return "bank_transfer";
    }

    @Override
    public String getPaymentMethodDisplayName() {
        return "Chuyển khoản ngân hàng";
    }

    @Override
    public String getPaymentMethodDescription() {
        return "Chuyển khoản trực tiếp đến tài khoản ngân hàng của chúng tôi";
    }
}