package com.ecspring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name="invoices")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
public class InvoiceEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name="invoice_number", nullable=false, unique=true)
    private String invoiceNumber;
    
    @Column(name="date_created", nullable=false)
    private LocalDateTime dateCreated;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_id", nullable=false, unique=true)
    private OrderEntity order;
}
