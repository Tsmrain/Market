package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.Resena;
import com.mutualista.mercado.domain.repository.ProductoRepository;
import com.mutualista.mercado.application.ClienteService;
import com.mutualista.mercado.infrastructure.storage.StorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
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
    private final StorageService storageService;

    public InteraccionClienteController(ProductoRepository productoRepo,
                                        ClienteService clienteService,
                                        MessageSource messageSource,
                                        StorageService storageService) {
        this.productoRepo = productoRepo;
        this.clienteService = clienteService;
        this.messageSource = messageSource;
        this.storageService = storageService;
    }

    // Caso de Uso: UC-A7 (Agregar Reseña)
    @PostMapping(value = "/{idProducto}/resenas", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public String agregarResena(
            @PathVariable Long idProducto,
            @RequestParam("calificacion") int calificacion,
            @RequestParam("comentario") String comentario,
            @RequestParam(value = "idCliente", required = false) Long idCliente,
            @RequestParam(value = "evidencias", required = false) MultipartFile[] evidencias) {

        // 1. Obtener la identidad del actor autenticado desde el contexto de seguridad
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String actorIdStr = null;
        String actorNombre = "Usuario";
        if (auth != null && auth.getPrincipal() instanceof Map) {
            Map<?, ?> principal = (Map<?, ?>) auth.getPrincipal();
            actorIdStr = (String) principal.get("id");
            actorNombre = (String) principal.get("nombre");
        }

        Long actorId = actorIdStr != null ? Long.valueOf(actorIdStr) : idCliente;
        if (actorId == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException(messageSource.getMessage("product.not.found", null, LocaleContextHolder.getLocale())));

        // 2. Delegar creación/obtención del cliente sombra (Pure Fabrication / High Cohesion)
        Cliente cliente = clienteService.obtenerOCrearClienteSombra(actorId, actorNombre);

        // 3. Patrón Creator: Delegar al Dominio
        Resena nuevaResena = producto.agregarResena(cliente, calificacion, comentario);

        // Validación de Variaciones Protegidas para máximo 2 archivos
        if (evidencias != null && evidencias.length > 0) {
            int validFilesCount = 0;
            for (MultipartFile archivo : evidencias) {
                if (archivo != null && !archivo.isEmpty()) {
                    validFilesCount++;
                }
            }
            if (validFilesCount > 2) {
                throw new IllegalArgumentException("No se permiten mas de 2 archivos de evidencia en la reseña.");
            }

            for (MultipartFile archivo : evidencias) {
                if (archivo == null || archivo.isEmpty()) continue;
                try {
                    String url = storageService.guardarArchivo(archivo.getBytes(), archivo.getOriginalFilename());
                    nuevaResena.agregarEvidencia(url, "imagen");
                } catch (Exception e) {
                    throw new RuntimeException("Error al guardar archivo de evidencia.", e);
                }
            }
        }

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

        Long actorId = actorIdStr != null ? Long.valueOf(actorIdStr) : idCliente;
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

    @DeleteMapping("/{idProducto}/resenas/{idResena}")
    public Map<String, String> eliminarResena(@PathVariable Long idProducto, @PathVariable Long idResena) {
        throw new UnsupportedOperationException("Borrado fisico de opiniones deshabilitado. Las reseñas no pueden ser removidas para preservar la integridad historica.");
    }
}
