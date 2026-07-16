package com.mutualista.mercado.infrastructure.messaging;

public interface WhatsAppAdapter {
    String generarEnlace(String telefonoBoliviano, String mensaje);
}
