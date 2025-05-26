package com.ecspring.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    // Location will be configured via environment variable
    private String location = "src/main/resources/static/uploads/products";

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
