package com.ecspring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name="products")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
public class ProductEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable=false)
    private String name;
    
    @Column(nullable=true, length=1000)
    private String description;
    
    @Column(nullable=false)
    private Double price;
    
    @Column(nullable=false)
    private Integer quantity;
    
    @Column(name="image_url", nullable=true)
    private String imageUrl;
    
    @Column(name="image_name", nullable=true)
    private String imageName;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedbackEntity> feedbacks = new ArrayList<>();
}
