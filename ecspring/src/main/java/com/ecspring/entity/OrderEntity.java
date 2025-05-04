package com.ecspring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name="orders")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
public class OrderEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name="order_number", nullable=false, unique=true)
    private String orderNumber;
    
    @Column(name="order_date", nullable=false)
    private LocalDateTime orderDate;
    
    @Column(nullable=false)
    private String status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private UserEntity user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineItemEntity> items = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private InvoiceEntity invoice;
    
    @Column(name="payment_method", nullable=false)
    private String paymentMethod;
    
    @Column(name="total_amount")
    private Double totalAmount;
    
    // Add shipping information including first and last name
    @Column(name="shipping_first_name")
    private String shippingFirstName;
    
    @Column(name="shipping_last_name")
    private String shippingLastName;
    
    @Column(name="shipping_phone")
    private String shippingPhone;
    
    @Column(name="shipping_address")
    private String shippingAddress;
    
    @Column(name="shipping_city")
    private String shippingCity;
    
    @Column(name="shipping_state")
    private String shippingState;
    
    @Column(name="shipping_zip_code")
    private String shippingZipCode;
}
