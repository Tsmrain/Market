package com.mutualista.mercado.domain;
import com.mutualista.mercado.infrastructure.messaging.WhatsAppAdapter;
import com.mutualista.mercado.infrastructure.messaging.WhatsAppAdapterImpl;


import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ContactoComercianteTest {

    @Test
    void testRegistrarClic_AumentaContador() {
        Comerciante comerciante = new Comerciante(1L, "Juan", "+54 9 11 1234-5678");
        assertEquals(0, comerciante.getClicsContacto());
        
        comerciante.registrarClicContacto(); // Information Expert
        assertEquals(1, comerciante.getClicsContacto(), "El contador debe incrementar en 1");
    }

    @Test
    void testWhatsAppAdapter_GeneraUrlCorrecta() {
        WhatsAppAdapter adapter = new WhatsAppAdapterImpl();
        String url = adapter.generarEnlace("71234567", "Hola mercado");
        
        // Debe prefijar 591, y codificar el espacio del texto como %20 o +
        assertTrue(url.startsWith("https://wa.me/59171234567"));
        assertTrue(url.contains("text=Hola+mercado") || url.contains("text=Hola%20mercado"));
    }
}
