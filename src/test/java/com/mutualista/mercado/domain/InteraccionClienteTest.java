package com.mutualista.mercado.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class InteraccionClienteTest {

    @Test
    void testAgregarResena_AplicaPatronCreator() {
        Categoria cat = new Categoria(1L, "Verduras");
        Producto producto = new Producto("Tomate", 2.50, cat);
        Cliente cliente = new Cliente(500L, "santiago@email.com");

        Resena nuevaResena = producto.agregarResena(cliente, 5, "Excelente calidad");

        assertNotNull(nuevaResena, "La reseña debe ser instanciada por el Producto");
        assertEquals(5, nuevaResena.getCalificacion());
        assertEquals("Excelente calidad", nuevaResena.getComentario());
        assertEquals(cliente, nuevaResena.getCliente());
        assertTrue(producto.getResenas().contains(nuevaResena), "El producto debe guardar la reseña internamente");
    }

    @Test
    void testAtributoDerivado_CantidadInteresados() {
        Categoria cat = new Categoria(1L, "Frutas");
        Producto producto = new Producto("Manzana", 3.00, cat);
        
        Cliente cliente1 = new Cliente(501L, "cliente1@email.com");
        Cliente cliente2 = new Cliente(502L, "cliente2@email.com");

        producto.agregarInteresado(cliente1);
        producto.agregarInteresado(cliente2);
        
        // Si el mismo cliente hace clic de nuevo, el Set lo ignora (Regla de negocio implícita)
        producto.agregarInteresado(cliente1);

        assertEquals(2, producto.getCantidadInteresados(), "El experto en información debe calcular correctamente el total");
    }
}
