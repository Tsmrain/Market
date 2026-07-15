package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Categoria;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.HistorialCategoria;
import com.mutualista.mercado.repository.CategoriaRepository;
import com.mutualista.mercado.repository.ComercianteRepository;
import com.mutualista.mercado.repository.ProductoRepository;
import com.mutualista.mercado.repository.HistorialCategoriaRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/panel/comerciantes/{idComerciante}/productos")
@CrossOrigin(origins = "*")
public class ComercianteCatalogoController {

    private final ComercianteRepository comercianteRepo;
    private final ProductoRepository productoRepo;
    private final CategoriaRepository categoriaRepo;
    private final StorageService storageService;
    private final ImageOptimizationService optimizador;
    private final HistorialCategoriaRepository historialRepo;
    private final UnidadMedidaNormalizador normalizador;

    public ComercianteCatalogoController(ComercianteRepository cRepo, ProductoRepository pRepo, 
                                         CategoriaRepository catRepo, StorageService sService, 
                                         ImageOptimizationService opt, HistorialCategoriaRepository hRepo,
                                         UnidadMedidaNormalizador norm) {
        this.comercianteRepo = cRepo;
        this.productoRepo = pRepo;
        this.categoriaRepo = catRepo;
        this.storageService = sService;
        this.optimizador = opt;
        this.historialRepo = hRepo;
        this.normalizador = norm;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarMisProductos(@PathVariable Long idComerciante) {
        return productoRepo.findByComercianteIdAndEliminadoFalse(idComerciante)
            .stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("nombre", p.getNombre());
                map.put("precio", p.getPrecio());
                map.put("estaDisponible", p.isEstaDisponible());
                return map;
            }).collect(Collectors.toList());
    }

    // UC-B2: Alta de Producto (Transacción Atómica con Multimedia Obligatoria y Categoría Estricta)
    @PostMapping
    @Transactional
    public Map<String, String> agregarProducto(
            @PathVariable Long idComerciante,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") double precio,
            @RequestParam("idCategoria") Long idCategoria,
            @RequestParam(value = "unidadMedida", required = false, defaultValue = "UNIDAD") String unidadMedida,
            @RequestParam(value = "descripcion", required = false, defaultValue = "") String descripcion,
            @RequestParam("archivos") MultipartFile[] archivos) {

        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        Categoria categoria = categoriaRepo.findById(idCategoria)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // REGLA DE NEGOCIO: Multimedia Obligatoria en creación
        if (archivos == null || archivos.length == 0 || archivos[0].isEmpty()) {
            throw new IllegalArgumentException("Debe subir al menos una imagen del producto.");
        }

        // Gobernanza de Datos: Normalización predictiva
        String unidadMedidaLimpia = normalizador.normalizar(unidadMedida);

        // Registrar producto (Creator / Information Expert)
        Producto producto = comerciante.registrarProducto(nombre, descripcion, precio, categoria, unidadMedidaLimpia);

        // Procesar archivos
        for (MultipartFile archivo : archivos) {
            try {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String tipo = ext.equalsIgnoreCase(".mp4") ? "video" : "imagen";
                
                byte[] bytesProcesados = tipo.equals("imagen") ? optimizador.optimizarImagen(archivo.getBytes(), ext) : archivo.getBytes();
                String url = storageService.guardarArchivo(bytesProcesados, nombreOriginal);
                producto.agregarMultimedia(url, tipo);
            } catch (Exception e) {
                throw new RuntimeException("Error guardando archivo del producto.", e);
            }
        }

        comercianteRepo.save(comerciante);
        return Map.of("mensaje", "Producto registrado exitosamente.");
    }

    @PutMapping("/{idProducto}/disponibilidad")
    @Transactional
    public Map<String, String> alternarDisponibilidad(@PathVariable Long idComerciante, @PathVariable Long idProducto) {
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.alternarDisponibilidad();
        productoRepo.save(producto);
        return Map.of("mensaje", "Estado actualizado.");
    }

    @DeleteMapping("/{idProducto}")
    @Transactional
    public Map<String, String> eliminarProducto(@PathVariable Long idComerciante, @PathVariable Long idProducto) {
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.eliminarLogicamente();
        productoRepo.save(producto);
        return Map.of("mensaje", "Producto eliminado exitosamente.");
    }

    // 1. EDICIÓN PURA DE TEXTO Y CATEGORÍA (Con Auditoría)
    @PutMapping("/{idProducto}")
    @Transactional
    public Map<String, String> editarProducto(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @RequestBody Map<String, Object> payload) {

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));

        // Actualizamos datos básicos
        String nombre = (String) payload.get("nombre");
        double precio = Double.parseDouble(payload.get("precio").toString());
        String unidadMedidaRaw = (String) payload.getOrDefault("unidadMedida", "UNIDAD");
        String descripcion = (String) payload.getOrDefault("descripcion", "");

        // Gobernanza de Datos: Normalización predictiva
        String unidadMedidaLimpia = normalizador.normalizar(unidadMedidaRaw);

        producto.actualizarDatos(nombre, precio, unidadMedidaLimpia, descripcion);

        // Manejo de Cambio de Categoría con Auditoría
        Long idCategoriaNueva = Long.valueOf(payload.get("idCategoria").toString());
        if (producto.getCategoria() == null || !producto.getCategoria().getId().equals(idCategoriaNueva)) {
            Categoria anteriorCat = producto.getCategoria();
            Categoria nuevaCat = categoriaRepo.findById(idCategoriaNueva)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            
            HistorialCategoria auditoria = new HistorialCategoria(producto, anteriorCat, nuevaCat, comerciante.getCi());
            historialRepo.save(auditoria); // Wait! "audordia"? Let's correct this typo to "auditoria"!
            
            producto.cambiarCategoria(nuevaCat);
        }

        productoRepo.save(producto);
        return Map.of("mensaje", "Producto y categoría actualizados correctamente (Auditado).");
    }

    // 2. AÑADIR MULTIMEDIA (Alta Cohesión: Solo archivos)
    @PostMapping("/{idProducto}/multimedia")
    @Transactional
    public List<Map<String, Object>> agregarMultimedia(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @RequestParam("archivos") MultipartFile[] archivos) {
        
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Regla: Máximo 5 archivos por producto
        if (producto.getGaleria().size() + archivos.length > 5) {
            throw new IllegalArgumentException("Un producto no puede tener más de 5 archivos multimedia.");
        }

        for (MultipartFile archivo : archivos) {
            try {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                String tipo = ext.equalsIgnoreCase(".mp4") ? "video" : "imagen";
                
                byte[] bytesProcesados = tipo.equals("imagen") ? optimizador.optimizarImagen(archivo.getBytes(), ext) : archivo.getBytes();
                String url = storageService.guardarArchivo(bytesProcesados, nombreOriginal);
                
                producto.agregarMultimedia(url, tipo);
            } catch (Exception e) {
                throw new RuntimeException("Error procesando el archivo.", e);
            }
        }
        productoRepo.save(producto);
        
        return producto.getGaleria().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("url", m.getUrl());
            map.put("tipo", m.getTipoArchivo());
            return map;
        }).collect(Collectors.toList());
    }

    // 3. ELIMINAR MULTIMEDIA ESPECÍFICA
    @DeleteMapping("/{idProducto}/multimedia/{idMultimedia}")
    @Transactional
    public List<Map<String, Object>> eliminarMultimedia(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @PathVariable Long idMultimedia) {
        
        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.eliminarMultimedia(idMultimedia);
        productoRepo.save(producto);
        
        return producto.getGaleria().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("url", m.getUrl());
            map.put("tipo", m.getTipoArchivo());
            return map;
        }).collect(Collectors.toList());
    }
}
