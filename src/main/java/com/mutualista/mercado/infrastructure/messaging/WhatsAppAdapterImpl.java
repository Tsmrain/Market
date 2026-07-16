package com.mutualista.mercado.infrastructure.messaging;

import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service // Pure Fabrication administrada por Spring
public class WhatsAppAdapterImpl implements WhatsAppAdapter {
    @Override
    public String generarEnlace(String telefonoBoliviano, String mensaje) {
        try {
            String urlCodificada = URLEncoder.encode(mensaje, StandardCharsets.UTF_8).replace("+", "%20");
            // Regla de Negocio: Se asume que el teléfono tiene 8 dígitos, se inyecta el 591
            return "https://wa.me/591" + telefonoBoliviano + "?text=" + urlCodificada;
        } catch (Exception e) {
            throw new RuntimeException("Error al codificar el enlace de WhatsApp", e);
        }
    }
}
