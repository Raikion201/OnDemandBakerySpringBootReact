package com.ecspring.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfoDto {
    @NotEmpty(message = "First name is required")
    private String firstName;
    
    @NotEmpty(message = "Last name is required")
    private String lastName;
    
    @NotEmpty(message = "Phone is required")
    private String phone;
    
    @NotEmpty(message = "Address is required")
    private String address;
    
    @NotEmpty(message = "City is required")
    private String city;
    
    @NotEmpty(message = "State is required")
    private String state;
    
    @NotEmpty(message = "ZIP code is required")
    private String zipCode;
}
