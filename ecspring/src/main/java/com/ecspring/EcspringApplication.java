package com.ecspring;

import com.ecspring.services.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.io.File;

@SpringBootApplication
public class EcspringApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcspringApplication.class, args);
    }

    @Bean
    CommandLineRunner init(StorageService storageService) {
        return (args) -> {
            // Create the directory for storing uploads
            File uploadDir = new File("src/main/resources/static/uploads/products");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Initialize the storage service
            storageService.init();
        };
    }
}
