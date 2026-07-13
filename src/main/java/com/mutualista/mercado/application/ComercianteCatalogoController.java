package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Categoria;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.repository.CategoriaRepository;
import com.mutualista.mercado.repository.ComercianteRepository;
import com.mutualista.mercado.repository.ProductoRepository;
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

    public ComercianteCatalogoController(ComercianteRepository cRepo, ProductoRepository pRepo, 
                                         CategoriaRepository catRepo, StorageService sService, 
                                         ImageOptimizationService opt) {
        this.comercianteRepo = cRepo;
        this.productoRepo = pRepo;
        this.categoriaRepo = catRepo;
        this.storageService = sService;
        this.optimizador = opt;
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
            @RequestParam("archivos") MultipartFile[] archivos) {

        // 1. Validar Regla de Negocio: Multimedia Obligatoria
        if (archivos == null || archivos.length == 0 || archivos[0].isEmpty()) {
            throw new IllegalArgumentException("Regla de negocio: Debe subir al menos una imagen del producto.");
        }

        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
            
        // 2. Validar Regla de Negocio: Categoría Estricta gestionada por el Administrador
        Categoria categoria = categoriaRepo.findById(idCategoria)
            .orElseThrow(() -> new RuntimeException("La categoría seleccionada no es válida."));

        // 3. Patrón Creator: El comerciante instancia el producto
        Producto nuevoProducto = comerciante.registrarProducto(nombre, precio, categoria);

        // 4. Procesamiento de Multimedia
        for (MultipartFile archivo : archivos) {
            try {
                String nombreOriginal = archivo.getOriginalFilename();
                if (nombreOriginal == null) continue;
                String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                byte[] bytesOptimizados = optimizador.optimizarImagen(archivo.getBytes(), extension);
                String urlLogica = storageService.guardarArchivo(bytesOptimizados, nombreOriginal);
                nuevoProducto.agregarMultimedia(urlLogica, "imagen");
            } catch (Exception e) {
                throw new RuntimeException("Error procesando la imagen. Se aborta la creación del producto.", e);
            }
        }

        comercianteRepo.save(comerciante);
        return Map.of("mensaje", "Producto creado exitosamente con " + archivos.length + " imagen(es).");
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

    // REGLA 2: Editar Producto (CRUD faltante)
    @PutMapping("/{idProducto}")
    @Transactional
    public Map<String, String> editarProducto(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") double precio,
            @RequestParam(value = "archivos", required = false) MultipartFile[] archivos) {

        Producto producto = productoRepo.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Information Expert: El producto actualiza sus atributos básicos
        producto.actualizarDatos(nombre, precio);

        // Si mandaron nuevas fotos, borramos las viejas y procesamos las nuevas
        if (archivos != null && archivos.length > 0 && !archivos[0].isEmpty()) {
            producto.limpiarGaleria();
            for (MultipartFile archivo : archivos) {
                try {
                    String nombreOriginal = archivo.getOriginalFilename();
                    if (nombreOriginal == null) continue;
                    String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
                    byte[] bytesOpt = optimizador.optimizarImagen(archivo.getBytes(), ext);
                    String url = storageService.guardarArchivo(bytesOpt, nombreOriginal);
                    producto.agregarMultimedia(url, "imagen");
                } catch (Exception e) {
                    throw new RuntimeException("Error procesando nueva imagen.", e);
                }
            }
        }
        productoRepo.save(producto);
        return Map.of("mensaje", "Producto editado exitosamente.");
    }
}
