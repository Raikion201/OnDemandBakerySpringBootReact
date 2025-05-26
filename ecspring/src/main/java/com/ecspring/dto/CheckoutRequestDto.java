package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDto {
    @Valid
    @NotNull(message = "Thông tin khách hàng không được để trống")
    private ShippingInfoDto customerInfo;

    @NotEmpty(message = "Đơn hàng không được để trống")
    private List<CheckoutOrderItemDto> orderItems;

    @NotEmpty(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    // Thông tin chi tiết thanh toán (tùy chọn, phụ thuộc vào phương thức thanh
    // toán)
    private Map<String, Object> paymentDetails;

    @NotNull(message = "Tổng tiền không được để trống")
    private Double totalAmount;

    private Boolean directPurchase = false;
}
