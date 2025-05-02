package com.ecspring.repositories;

import com.ecspring.entity.InvoiceEntity;
import com.ecspring.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {
    Optional<InvoiceEntity> findByOrder(OrderEntity order);
    Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);
}
