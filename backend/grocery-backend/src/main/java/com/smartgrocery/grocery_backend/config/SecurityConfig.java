package com.smartgrocery.grocery_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import com.smartgrocery.grocery_backend.security.JwtFilter;
import com.smartgrocery.grocery_backend.security.JwtService;

@Configuration
public class SecurityConfig {

    @Bean
    public JwtFilter jwtFilter(JwtService jwtService) {
        return new JwtFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint((request, response, authException) -> {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("Unauthorized");
            }))
            .authorizeHttpRequests(auth -> auth
                    // Public endpoints
                    .requestMatchers("/auth/login", "/auth/register").permitAll()
                    .requestMatchers("/auth/forgot-password").permitAll()
                    .requestMatchers("/userauth/login", "/userauth/register").permitAll()
                    .requestMatchers("/userauth/forgot-password").permitAll()
                    .requestMatchers(HttpMethod.GET, "/products").permitAll()
                    // Customer-only endpoints (JWT required)
                    .requestMatchers(HttpMethod.POST, "/cart").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.GET, "/cart").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.PUT, "/cart/*").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.DELETE, "/cart/*").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.POST, "/orders").hasRole("CUSTOMER")
                    .requestMatchers("/recommend/**").permitAll()
                    // Admin-only endpoints
                    .requestMatchers(HttpMethod.POST, "/upload").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/products").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/products/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/products/**").hasRole("ADMIN")
                    // Orders can be viewed by either admin or customer (tenant isolation in controller)
                    .requestMatchers(HttpMethod.GET, "/orders").hasAnyRole("ADMIN", "CUSTOMER")
                    .requestMatchers(HttpMethod.PUT, "/orders/*/status").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/user/profile").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.PUT, "/api/user/profile").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.POST, "/api/user/profile/upload-image").hasRole("CUSTOMER")
                    .requestMatchers(HttpMethod.GET, "/uploads/profile/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/admin/profile").hasRole("ADMIN")
                    .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}