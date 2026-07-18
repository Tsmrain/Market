package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.application.ImageOptimizationService;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.infrastructure.storage.StorageService;
import com.mutualista.mercado.domain.repository.ProductoRepository;


import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/comerciante")
public class ComercianteController {

    private final ProductoRepository productoRepo;
    private final StorageService storageService;
    private final ImageOptimizationService optimizador;

    public ComercianteController(ProductoRepository pRepo, StorageService sService, ImageOptimizationService opt) {
        this.productoRepo = pRepo;
        this.storageService = sService;
        this.optimizador = opt;
    }

    // UC-B2: Subir múltiples fotos al producto
    @PostMapping("/productos/{idProducto}/multimedia")
    @Transactional
    public String subirMultimedia(@PathVariable Long idProducto, @RequestParam("archivos") MultipartFile[] archivos) {
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        for (MultipartFile archivo : archivos) {
            try {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                
                // 1. Delegar optimización (Information Expert)
                byte[] bytesOptimizados = optimizador.optimizarImagen(archivo.getBytes(), extension);
                
                // 2. Delegar almacenamiento físico (Adapter / Protected Variation)
                String urlLogica = storageService.guardarArchivo(bytesOptimizados, nombreOriginal);
                
                // 3. Delegar asociación al Dominio (Creator)
                producto.agregarMultimedia(urlLogica, "imagen");
                
            } catch (Exception e) {
                throw new RuntimeException("Error procesando archivo", e);
            }
        }
        productoRepo.save(producto);
        return "Archivos subidos y optimizados con éxito.";
    }
}
