package com.ecspring.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

@Setter
@Getter
@Entity
@Table(name="users")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor

public class UserEntity {


    public UserEntity(String username,String email,String name){ 
        this.username = username;
        this.email = email;
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=true)
    private String name;

    @Column(nullable=false,unique = true)
    private String username;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER, cascade=CascadeType.ALL)
    @JoinTable(
            name="users_roles",
            joinColumns={@JoinColumn(name="USER_ID", referencedColumnName="ID")},
            inverseJoinColumns={@JoinColumn(name="ROLE_ID", referencedColumnName="ID")})
    private List<RoleEntity> roles = new ArrayList<>();

    
}