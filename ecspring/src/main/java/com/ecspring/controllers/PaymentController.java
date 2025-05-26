package com.ecspring.controllers;

import com.ecspring.dto.PaymentMethodDto;
import com.ecspring.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethodDto>> getPaymentMethods() {
        List<PaymentMethodDto> methods = paymentService.getAvailablePaymentMethods();
        return ResponseEntity.ok(methods);
    }
}