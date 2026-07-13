package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
public class InteraccionClienteController {

    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;

    public InteraccionClienteController(ProductoRepository productoRepo, ClienteRepository clienteRepo) {
        this.productoRepo = productoRepo;
        this.clienteRepo = clienteRepo;
    }

    // Caso de Uso: UC-A7 (Agregar Reseña)
    @PostMapping("/{idProducto}/resenas")
    @Transactional
    public String agregarResena(@PathVariable Long idProducto, @RequestBody NuevaResenaRequest request) {
        // 1. Mediación Técnica (Indirection)
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Cliente cliente = clienteRepo.findById(request.getIdCliente())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 2. Patrón Creator: Delegar al Dominio
        producto.agregarResena(cliente, request.getCalificacion(), request.getComentario());
        productoRepo.save(producto); // Se guarda en cascada

        return "Reseña agregada con éxito.";
    }

    // Caso de Uso: UC-A6 (Marcar Interés)
    @PostMapping("/{idProducto}/interesados/{idCliente}")
    @Transactional
    public String marcarInteres(@PathVariable Long idProducto, @PathVariable Long idCliente) {
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Cliente cliente = clienteRepo.findById(idCliente)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 3. Patrón Information Expert: Delegar al Dominio
        producto.agregarInteresado(cliente);
        productoRepo.save(producto);

        return "Interés registrado. Total de interesados actualmente: " + producto.getCantidadInteresados();
    }
}
