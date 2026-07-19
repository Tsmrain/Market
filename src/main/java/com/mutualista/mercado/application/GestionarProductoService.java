package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.domain.repository.*;
import com.mutualista.mercado.presentation.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.mutualista.mercado.infrastructure.storage.StorageService;
import java.util.List;
import java.util.ArrayList;

@Service
public class GestionarProductoService {

    private final ComercianteRepository comercianteRepo;
    private final ProductoRepository productoRepo;
    private final CategoriaRepository categoriaRepo;
    private final StorageService storageService;
    private final ImageOptimizationService optimizador;
    private final HistorialCategoriaRepository historialRepo;
    private final UnidadMedidaNormalizador normalizador;
    private final UnidadMedidaMaestraRepository unidadRepo;

    public GestionarProductoService(ComercianteRepository cRepo, ProductoRepository pRepo,
                                    CategoriaRepository catRepo, StorageService sService,
                                    ImageOptimizationService opt, HistorialCategoriaRepository hRepo,
                                    UnidadMedidaNormalizador norm, UnidadMedidaMaestraRepository uRepo) {
        this.comercianteRepo = cRepo;
        this.productoRepo = pRepo;
        this.categoriaRepo = catRepo;
        this.storageService = sService;
        this.optimizador = opt;
        this.historialRepo = hRepo;
        this.normalizador = norm;
        this.unidadRepo = uRepo;
    }

    @Transactional(readOnly = true)
    public List<Producto> findByComercianteIdAndEliminadoFalse(Long idComerciante) {
        return productoRepo.findByComercianteIdAndEliminadoFalse(idComerciante);
    }

    @Transactional
    public ProductoDetalleDTO actualizarProducto(Long idComerciante, Long idProducto, EditarProductoRequestDTO dto) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));

        // Validar solvencia del comerciante (Information Expert)
        comerciante.verificarSolvencia();

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!productoRepo.findByComercianteIdAndEliminadoFalse(idComerciante).contains(producto)) {
            throw new RuntimeException("El producto no pertenece al comerciante.");
        }

        // Gobernanza de Datos
        String unidadMedidaLimpia = normalizador.normalizar(dto.getUnidadMedida());
        UnidadMedidaMaestra unidad = unidadRepo.findByCodigo(unidadMedidaLimpia)
            .orElseThrow(() -> new DomainValidationException("La unidad de medida '" + unidadMedidaLimpia + "' no existe en el catálogo maestro."));
        String marcaFinal = (dto.getMarca() == null || dto.getMarca().trim().isEmpty()) ? "Genérico" : dto.getMarca().trim();

        // Guardar estado actual de multimedia antes de la actualización
        List<String> urlsAnteriores = new ArrayList<>();
        if (producto.getGaleria() != null) {
            for (Multimedia m : producto.getGaleria()) {
                urlsAnteriores.add(m.getUrl());
            }
        }

        // Mutación a través de Expertos
        producto.actualizarDatos(dto, unidad, marcaFinal);

        if (dto.getUrlsMultimedia() != null) {
            producto.sincronizarMultimedia(dto.getUrlsMultimedia());
        }

        // Auditoría de Categoría
        if (producto.getCategoria() == null || !producto.getCategoria().getId().equals(dto.getIdCategoria())) {
            Categoria anteriorCat = producto.getCategoria();
            Categoria nuevaCat = categoriaRepo.findById(dto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            HistorialCategoria auditoria = new HistorialCategoria(producto, anteriorCat, nuevaCat, comerciante.getCi());
            historialRepo.save(auditoria);
            producto.cambiarCategoria(nuevaCat);
        }

        try {
            productoRepo.save(producto);
            productoRepo.flush();
        } catch (Exception e) {
            // Compensación: borrar del disco físico las nuevas imágenes si falla la base de datos al guardar
            if (dto.getUrlsMultimedia() != null) {
                for (String url : dto.getUrlsMultimedia()) {
                    if (!urlsAnteriores.contains(url)) {
                        try {
                            storageService.borrarArchivo(url);
                        } catch (Exception ex) {
                            System.err.println("Error borrando archivo durante compensación: " + ex.getMessage());
                        }
                    }
                }
            }
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Error al guardar cambios del producto. Transacción revertida.", e);
        }

        return new ProductoDetalleDTO(producto, comerciante);
    }

    @Transactional
    public List<Multimedia> agregarMultimedia(Long idComerciante, Long idProducto, MultipartFile[] archivos) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        comerciante.verificarSolvencia();

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getGaleria().size() + archivos.length > 5) {
            throw new IllegalArgumentException("Un producto no puede tener más de 5 archivos multimedia.");
        }

        List<String> guardados = new ArrayList<>();
        try {
            for (MultipartFile archivo : archivos) {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String tipo = ext.equalsIgnoreCase(".mp4") ? "video" : "imagen";

                byte[] bytesProcesados = tipo.equals("imagen") ? optimizador.optimizarImagen(archivo.getBytes(), ext) : archivo.getBytes();
                String url = storageService.guardarArchivo(bytesProcesados, nombreOriginal);
                guardados.add(url);

                producto.agregarMultimedia(url, tipo);
            }
            productoRepo.save(producto);
            productoRepo.flush();
        } catch (Exception e) {
            // Estrategia de Compensación
            for (String url : guardados) {
                try {
                    storageService.borrarArchivo(url);
                } catch (Exception ex) {
                    System.err.println("Error borrando archivo durante compensación: " + ex.getMessage());
                }
            }
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Error guardando archivos del producto. Transacción revertida.", e);
        }
        return producto.getGaleria();
    }

    @Transactional
    public List<Multimedia> eliminarMultimedia(Long idComerciante, Long idProducto, Long idMultimedia) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        comerciante.verificarSolvencia();

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.getGaleria().stream()
            .filter(m -> m.getId().equals(idMultimedia))
            .findFirst()
            .ifPresent(m -> storageService.borrarArchivo(m.getUrl()));

        producto.eliminarMultimedia(idMultimedia);
        productoRepo.save(producto);
        productoRepo.flush();

        return producto.getGaleria();
    }

    @Transactional
    public void alternarDisponibilidad(Long idComerciante, Long idProducto) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        comerciante.verificarSolvencia();

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.alternarDisponibilidad();
        productoRepo.save(producto);
    }

    @Transactional
    public void archivarProducto(Long idComerciante, Long idProducto) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        comerciante.verificarSolvencia();

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.archivar();
        productoRepo.save(producto);
    }

    @Transactional
    public void registrarProducto(Long idComerciante, String nombre, double precio, Long idCategoria, String unidadMedida, String descripcion, String marca, MultipartFile[] archivos) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        comerciante.verificarSolvencia();

        Categoria categoria = categoriaRepo.findById(idCategoria)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (archivos == null || archivos.length == 0 || archivos[0].isEmpty()) {
            throw new IllegalArgumentException("Debe subir al menos una imagen del producto.");
        }

        String unidadMedidaLimpia = normalizador.normalizar(unidadMedida);
        if (!unidadRepo.findByCodigo(unidadMedidaLimpia).isPresent()) {
            throw new IllegalArgumentException("La unidad de medida '" + unidadMedidaLimpia + "' no existe en el catálogo maestro.");
        }
        String marcaFinal = (marca == null || marca.trim().isEmpty()) ? "Genérico" : marca.trim();

        // Validaciones del dominio delegadas a Producto
        Producto producto = comerciante.registrarProducto(nombre, descripcion, precio, categoria, unidadMedidaLimpia);
        producto.setMarca(marcaFinal);

        // Validación manual del precio
        if (precio < 0) {
            throw new DomainValidationException("El precio del producto no puede ser negativo.");
        }

        List<String> guardados = new ArrayList<>();
        try {
            for (MultipartFile archivo : archivos) {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String tipo = ext.equalsIgnoreCase(".mp4") ? "video" : "imagen";

                byte[] bytesProcesados = tipo.equals("imagen") ? optimizador.optimizarImagen(archivo.getBytes(), ext) : archivo.getBytes();
                String url = storageService.guardarArchivo(bytesProcesados, nombreOriginal);
                guardados.add(url);

                producto.agregarMultimedia(url, tipo);
            }
            comercianteRepo.save(comerciante);
            comercianteRepo.flush();
        } catch (Exception e) {
            // Estrategia de Compensación
            for (String url : guardados) {
                try {
                    storageService.borrarArchivo(url);
                } catch (Exception ex) {
                    System.err.println("Error borrando archivo durante compensación: " + ex.getMessage());
                }
            }
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Error guardando archivos del producto. Transacción revertida.", e);
        }
    }
}
