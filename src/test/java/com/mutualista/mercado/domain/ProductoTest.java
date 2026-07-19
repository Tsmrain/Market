package com.mutualista.mercado.domain;

import com.mutualista.mercado.presentation.dto.EditarProductoRequestDTO;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class ProductoTest {

    @Test
    void testActualizarDatos_ConNombreVacio_LanzaException() {
        Categoria categoria = new Categoria(1L, "Frutas");
        Producto producto = new Producto("Manzana", 10.0, categoria);
        UnidadMedidaMaestra kg = new UnidadMedidaMaestra("KG", "UNIT_KG", true);

        EditarProductoRequestDTO dto = new EditarProductoRequestDTO();
        dto.setNombre("");
        dto.setPrecio(15.0);

        assertThrows(DomainValidationException.class, () -> {
            producto.actualizarDatos(dto, kg, "Genérico");
        });
    }

    @Test
    void testActualizarDatos_ConPrecioNegativo_LanzaException() {
        Categoria categoria = new Categoria(1L, "Frutas");
        Producto producto = new Producto("Manzana", 10.0, categoria);
        UnidadMedidaMaestra kg = new UnidadMedidaMaestra("KG", "UNIT_KG", true);

        EditarProductoRequestDTO dto = new EditarProductoRequestDTO();
        dto.setNombre("Manzana Roja");
        dto.setPrecio(-5.0);

        assertThrows(DomainValidationException.class, () -> {
            producto.actualizarDatos(dto, kg, "Genérico");
        });
    }

    @Test
    void testActualizarDatos_ConDatosValidos_ActualizaAtributos() {
        Categoria categoria = new Categoria(1L, "Frutas");
        Producto producto = new Producto("Manzana", 10.0, categoria);
        UnidadMedidaMaestra kg = new UnidadMedidaMaestra("KG", "UNIT_KG", true);

        EditarProductoRequestDTO dto = new EditarProductoRequestDTO();
        dto.setNombre("Manzana Roja");
        dto.setPrecio(15.5);
        dto.setDescripcion("Manzanas frescas");
        dto.setMarca("Del Valle");

        producto.actualizarDatos(dto, kg, "Del Valle");

        assertEquals("Manzana Roja", producto.getNombre());
        assertEquals(15.5, producto.getPrecio());
        assertEquals("KG", producto.getUnidadMedida());
        assertEquals("Manzanas frescas", producto.getDescripcion());
        assertEquals("Del Valle", producto.getMarca());
    }

    @Test
    void testSincronizarMultimedia_ReemplazaGaleriaCompletamente() {
        Categoria categoria = new Categoria(1L, "Frutas");
        Producto producto = new Producto("Manzana", 10.0, categoria);

        producto.agregarMultimedia("/uploads/foto1.jpg", "imagen");
        producto.agregarMultimedia("/uploads/foto2.jpg", "imagen");
        assertEquals(2, producto.getGaleria().size());

        producto.sincronizarMultimedia(Arrays.asList("/uploads/foto3.jpg", "/uploads/video1.mp4"));

        assertEquals(2, producto.getGaleria().size());
        assertEquals("/uploads/foto3.jpg", producto.getGaleria().get(0).getUrl());
        assertEquals("imagen", producto.getGaleria().get(0).getTipoArchivo());
        assertEquals("/uploads/video1.mp4", producto.getGaleria().get(1).getUrl());
        assertEquals("video", producto.getGaleria().get(1).getTipoArchivo());
    }
}
