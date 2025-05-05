package com.ecspring.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class CorsConfig {
    
    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${app.cors.allowed-origins:${app.frontend-url:http://localhost:3000}}")
    private String[] allowedOrigins;
    
    @Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,PATCH,OPTIONS}")
    private String allowedMethodsString;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Use environment variables for allowed origins
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        
        // Parse allowed methods from environment variable
        List<String> allowedMethods = Arrays.asList(allowedMethodsString.split(","));
        configuration.setAllowedMethods(allowedMethods);
        
        // Allowed headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // This will set Access-Control-Allow-Credentials: true
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
