package com.ecspring.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ecspring.security.jwt.AuthTokenFilter;
import com.ecspring.security.oauth2.CustomOAuth2UserService;
import com.ecspring.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.ecspring.security.services.UserDetailsServiceImpl;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SpringSecurity {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private CustomOAuth2UserService oAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider DaoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> {
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                    // Explicitly disable session tracking
                    session.disable();
                })
                // This is the key change - return 401 status instead of redirecting
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        // For unauthenticated requests (no/invalid JWT) - 401 Unauthorized
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        // For authenticated but unauthorized requests - 403 Forbidden
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Access Denied\",\"message\":\"" +
                                    accessDeniedException.getMessage() + "\"}");
                        }))
                .authorizeHttpRequests(authorize -> authorize
                        // Add more specific patterns first
                        .requestMatchers("/oauth2/authorization/**").permitAll()
                        .requestMatchers("/login/oauth2/code/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF", "OWNER")
                        .requestMatchers("/api/auth/forgot-password").permitAll()
                        .requestMatchers("/api/auth/validate-reset-token").permitAll()
                        .requestMatchers("/api/auth/reset-password").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/orders/checkout").authenticated()
                        .anyRequest().authenticated())
                // Configure OAuth2 login with specific paths
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authEndpoint -> authEndpoint.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(redirectEndpoint -> redirectEndpoint.baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                        .successHandler(oAuth2AuthenticationSuccessHandler));

        // Add authentication provider
        http.authenticationProvider(DaoAuthenticationProvider());

        // Add JWT filter before authentication filter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}