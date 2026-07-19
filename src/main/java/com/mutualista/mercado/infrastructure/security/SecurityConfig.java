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
                .requestMatchers(HttpMethod.GET, "/api/admin/categorias/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Endpoints de escritura de categorías exclusivos para SUPERADMIN
                .requestMatchers(HttpMethod.POST, "/api/admin/categorias/**").hasRole("SUPERADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/categorias/**").hasRole("SUPERADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/categorias/**").hasRole("SUPERADMIN")
                .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasRole("SUPERADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasRole("SUPERADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole("SUPERADMIN")

                // Exigir autenticación para endpoints transaccionales del cliente/actor
                .requestMatchers(HttpMethod.POST, "/api/portal/comerciantes/*/contactar").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/portal/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/portal/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/portal/**").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/productos/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").authenticated()

                .anyRequest().permitAll()
            )
            .addFilterBefore(simpleHeaderAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
