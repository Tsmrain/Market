package com.mutualista.mercado.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SimpleHeaderAuthFilter simpleHeaderAuthFilter;

    public SecurityConfig(SimpleHeaderAuthFilter simpleHeaderAuthFilter) {
        this.simpleHeaderAuthFilter = simpleHeaderAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("*"));
                config.setAllowedMethods(List.of("*"));
                config.setAllowedHeaders(List.of("*"));
                return config;
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/portal/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/multimedia/**").permitAll()
                
                // Exigir rol CLIENTE para endpoints transaccionales del cliente
                .requestMatchers(HttpMethod.POST, "/api/portal/comerciantes/*/contactar").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST, "/api/portal/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PUT, "/api/portal/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/portal/**").hasRole("CLIENTE")
                
                .requestMatchers(HttpMethod.POST, "/api/productos/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("CLIENTE")
                
                .anyRequest().permitAll()
            )
            .addFilterBefore(simpleHeaderAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
