package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.infrastructure.messaging.WhatsAppAdapter;
import com.mutualista.mercado.presentation.dto.CategoriaDTO;
import com.mutualista.mercado.presentation.dto.ComerciantePerfilDTO;
import com.mutualista.mercado.presentation.dto.ProductoDetalleDTO;
import com.mutualista.mercado.presentation.dto.ProductoResumenDTO;
import com.mutualista.mercado.repository.CategoriaRepository;
import com.mutualista.mercado.repository.ComercianteRepository;
import com.mutualista.mercado.repository.ProductoRepository;
import com.mutualista.mercado.repository.UnidadMedidaMaestraRepository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/portal")
public class PortalClienteController {

    private final ProductoRepository productoRepo;
    private final ComercianteRepository comercianteRepo;
    private final CategoriaRepository categoriaRepo;
    private final WhatsAppAdapter whatsAppAdapter;
    private final UnidadMedidaMaestraRepository unidadRepo;

    public PortalClienteController(ProductoRepository pRepo, ComercianteRepository cRepo, CategoriaRepository catRepo, WhatsAppAdapter wAdapter, UnidadMedidaMaestraRepository uRepo) {
        this.productoRepo = pRepo;
        this.comercianteRepo = cRepo;
        this.categoriaRepo = catRepo;
        this.whatsAppAdapter = wAdapter;
        this.unidadRepo = uRepo;
    }

    @GetMapping("/unidades")
    @Transactional(readOnly = true)
    public List<UnidadMedidaMaestra> listarUnidadesPublico() {
        return unidadRepo.findAll();
    }

    // UC-A8: Consultar Listado de Categorías (Regla de Visibilidad)
    @GetMapping("/categorias")
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerCategoriasActivas() {
        return categoriaRepo.findCategoriasConProductosActivos().stream()
            .map(CategoriaDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/categorias/todas")
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerTodasLasCategorias() {
        return categoriaRepo.findAll().stream()
            .map(CategoriaDTO::new).collect(Collectors.toList());
    }

    // UC-A1 y UC-A1.1: Catálogo con Filtrado
    @GetMapping("/productos")
    @Transactional(readOnly = true)
    public Page<ProductoResumenDTO> obtenerCatalogo(
            @RequestParam(required = false) String buscar, 
            @RequestParam(required = false) Long idCategoria,
            Pageable pageable) {
        
        Page<Producto> productos;
        if (buscar != null && !buscar.trim().isEmpty() && idCategoria != null) {
            productos = productoRepo.findByNombreAndCategoriaJerarquia(buscar, idCategoria, pageable);
        } else if (buscar != null && !buscar.trim().isEmpty()) {
            productos = productoRepo.findByNombreContainingIgnoreCaseAndEliminadoFalse(buscar, pageable);
        } else if (idCategoria != null) {
            productos = productoRepo.findByCategoriaJerarquia(idCategoria, pageable);
        } else {
            productos = productoRepo.findByEliminadoFalse(pageable);
        }
        return productos.map(ProductoResumenDTO::new);
    }

    @GetMapping("/productos/{idProducto}")
    @Transactional(readOnly = true)
    public ProductoDetalleDTO obtenerDetalleProducto(@PathVariable Long idProducto) {
        Producto producto = productoRepo.findById(idProducto)
            .filter(p -> !p.isEliminado())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Comerciante comerciante = comercianteRepo.findByProductoId(idProducto).orElse(null);
        return new ProductoDetalleDTO(producto, comerciante);
    }

    @GetMapping("/comerciantes/{idComerciante}")
    @Transactional(readOnly = true)
    public ComerciantePerfilDTO obtenerPerfilComerciante(@PathVariable Long idComerciante) {
        return new ComerciantePerfilDTO(comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado")));
    }

    // Modificación Iteración 12: Contexto de Producto en WhatsApp
    @PostMapping("/comerciantes/{idComerciante}/contactar")
    @Transactional
    public Map<String, String> contactarComerciante(@PathVariable Long idComerciante, @RequestParam(required = false) Long idProducto) {
        Comerciante comerciante = comercianteRepo.findById(idComerciante).orElseThrow();
        comerciante.registrarClicContacto();
        comercianteRepo.save(comerciante);
        
        String mensaje = "";
        if (idProducto != null) {
            Producto producto = productoRepo.findById(idProducto).orElseThrow();
            mensaje = "Hola " + comerciante.getNombre() + ". Estoy interesado en su producto: *" + producto.getNombre() + "* a " + producto.getPrecio() + " Bs. / " + producto.getUnidadMedida() + " que vi en la app del Mercado Mutualista.";
        } else {
            mensaje = "Hola " + comerciante.getNombre() + ". Me comunico desde el catálogo de la app del Mercado Mutualista.";
        }

        String urlContacto = whatsAppAdapter.generarEnlace(comerciante.getTelefono(), mensaje);
        return Map.of("url", urlContacto);
    }
}
