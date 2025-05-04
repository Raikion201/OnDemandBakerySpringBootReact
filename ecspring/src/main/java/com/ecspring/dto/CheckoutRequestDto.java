package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDto {
    @Valid
    @NotNull(message = "Customer information is required")
    private ShippingInfoDto customerInfo;
    
    @NotEmpty(message = "Order items cannot be empty")
    private List<CheckoutOrderItemDto> orderItems;
    
    @NotEmpty(message = "Payment method is required")
    private String paymentMethod;
    
    @NotNull(message = "Total amount is required")
    private Double totalAmount;
    
    private Boolean directPurchase = false;
}
