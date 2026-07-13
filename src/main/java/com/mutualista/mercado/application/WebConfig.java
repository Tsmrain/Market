package com.mutualista.mercado.application;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapea la URL /api/public/multimedia/ hacia la carpeta física ./uploads/
        registry.addResourceHandler("/api/public/multimedia/**")
                .addResourceLocations("file:./uploads/");
    }
}
