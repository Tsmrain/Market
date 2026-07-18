package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.presentation.dto.NuevaResenaRequest;
import com.mutualista.mercado.domain.repository.ProductoRepository;
import com.mutualista.mercado.application.ClienteService;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
public class InteraccionClienteController {

    private final ProductoRepository productoRepo;
    private final ClienteService clienteService;
    private final MessageSource messageSource;

    public InteraccionClienteController(ProductoRepository productoRepo, 
                                        ClienteService clienteService,
                                        MessageSource messageSource) {
        this.productoRepo = productoRepo;
        this.clienteService = clienteService;
        this.messageSource = messageSource;
    }

    // Caso de Uso: UC-A7 (Agregar Reseña)
    @PostMapping("/{idProducto}/resenas")
    @Transactional
    public String agregarResena(@PathVariable Long idProducto, @RequestBody NuevaResenaRequest request) {
        // 1. Obtener la identidad del actor autenticado desde el contexto de seguridad
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String actorIdStr = null;
        String actorNombre = "Usuario";
        if (auth != null && auth.getPrincipal() instanceof Map) {
            Map<?, ?> principal = (Map<?, ?>) auth.getPrincipal();
            actorIdStr = (String) principal.get("id");
            actorNombre = (String) principal.get("nombre");
        }

        Long actorId = actorIdStr != null ? Long.parseLong(actorIdStr) : request.getIdCliente();
        if (actorId == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException(messageSource.getMessage("product.not.found", null, LocaleContextHolder.getLocale())));

        // 2. Delegar creación/obtención del cliente sombra (Pure Fabrication / High Cohesion)
        Cliente cliente = clienteService.obtenerOCrearClienteSombra(actorId, actorNombre);

        // 3. Patrón Creator: Delegar al Dominio
        producto.agregarResena(cliente, request.getCalificacion(), request.getComentario());
        productoRepo.save(producto);

        return messageSource.getMessage("review.added", null, LocaleContextHolder.getLocale());
    }

    // Caso de Uso: UC-A6 (Marcar Interés)
    @PostMapping("/{idProducto}/interesados/{idCliente}")
    @Transactional
    public String marcarInteres(@PathVariable Long idProducto, @PathVariable Long idCliente) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String actorIdStr = null;
        String actorNombre = "Usuario";
        if (auth != null && auth.getPrincipal() instanceof Map) {
            Map<?, ?> principal = (Map<?, ?>) auth.getPrincipal();
            actorIdStr = (String) principal.get("id");
            actorNombre = (String) principal.get("nombre");
        }

        Long actorId = actorIdStr != null ? Long.parseLong(actorIdStr) : idCliente;
        if (actorId == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException(messageSource.getMessage("product.not.found", null, LocaleContextHolder.getLocale())));

        // Delegar creación/obtención del cliente sombra
        Cliente cliente = clienteService.obtenerOCrearClienteSombra(actorId, actorNombre);

        // Patrón Information Expert: Delegar al Dominio
        producto.agregarInteresado(cliente);
        productoRepo.save(producto);

        return messageSource.getMessage("interest.registered", new Object[]{ producto.getCantidadInteresados() }, LocaleContextHolder.getLocale());
    }
}
