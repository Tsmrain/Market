package com.mutualista.mercado.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ComercianteTest {

    @Test
    void testRegistrarProducto_AplicaPatronCreator() {
        // 1. Precondiciones
        Categoria categoria = new Categoria(1L, "Verduras");
        Comerciante comerciante = new Comerciante(100L, "Juan Perez", "+591 7 123-4567");

        // 2. Ejecución del mensaje diseñado (Diagrama de Secuencia de Diseño)
        Producto nuevoProducto = comerciante.registrarProducto("Tomate Perita", 2.50, categoria);

        // 3. Verificación de Postcondiciones del Contrato
        assertNotNull(nuevoProducto, "El producto debe haber sido instanciado por el Comerciante");
        assertEquals("Tomate Perita", nuevoProducto.getNombre());
        assertEquals(2.50, nuevoProducto.getPrecio());
        assertEquals(categoria, nuevoProducto.getCategoria(), "El producto debe estar asociado a la categoría");

        // Verificamos Alta Cohesión: El producto se guardó en el catálogo interno
        assertTrue(comerciante.getCatalogo().contains(nuevoProducto), "El producto debe estar en el catálogo");
    }

    @Test
    void testVerificarSolvencia_ConCuotaPendiente_LanzaException() {
        Comerciante comerciante = new Comerciante(101L, "María Gomez", "77777777");
        CuotaMensual cuota = new CuotaMensual(comerciante, 7, 2026, 31.0);
        // Por defecto, la cuota está PENDIENTE
        comerciante.setCuotas(java.util.Arrays.asList(cuota));

        assertThrows(DomainValidationException.class, () -> {
            comerciante.verificarSolvencia();
        });
    }

    @Test
    void testVerificarSolvencia_SinCuotas_EsSolvente() {
        Comerciante comerciante = new Comerciante(102L, "Pedro Gomez", "77777778");
        assertDoesNotThrow(() -> {
            comerciante.verificarSolvencia();
        });
    }

    @Test
    void testVerificarSolvencia_ConCuotaPagada_EsSolvente() {
        Comerciante comerciante = new Comerciante(103L, "Luis Gomez", "77777779");
        CuotaMensual cuota = new CuotaMensual(comerciante, 7, 2026, 31.0);
        cuota.registrarPago();
        comerciante.setCuotas(java.util.Arrays.asList(cuota));

        assertDoesNotThrow(() -> {
            comerciante.verificarSolvencia();
        });
    }
}
