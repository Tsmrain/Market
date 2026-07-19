package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.infrastructure.messaging.WhatsAppAdapter;
import com.mutualista.mercado.presentation.dto.CategoriaDTO;
import com.mutualista.mercado.presentation.dto.ComerciantePerfilDTO;
import com.mutualista.mercado.presentation.dto.ProductoDetalleDTO;
import com.mutualista.mercado.presentation.dto.ProductoResumenDTO;
import com.mutualista.mercado.domain.repository.CategoriaRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.ProductoRepository;
import com.mutualista.mercado.domain.repository.UnidadMedidaMaestraRepository;


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
    public org.springframework.data.domain.Page<ProductoResumenDTO> listarProductos(
            @RequestParam(required = false) Long idCategoria,
            @RequestParam(required = false) String buscar,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) Integer estrellasMinimas,
            org.springframework.data.domain.Pageable pageable,
            jakarta.servlet.http.HttpServletResponse response) {

        response.setHeader("Cache-Control", "no-cache");
        Double estrellas = estrellasMinimas != null ? estrellasMinimas.doubleValue() : null;
        String buscarLimpio = (buscar != null && !buscar.trim().isEmpty()) ? buscar.trim() : null;

        org.springframework.data.domain.Page<Producto> productos = productoRepo.findProductosConFiltros(
                idCategoria,
                buscarLimpio,
                precioMin,
                precioMax,
                estrellas,
                pageable
        );
        return productos.map(ProductoResumenDTO::new);
    }

    @GetMapping("/productos/{idProducto}")
    @Transactional(readOnly = true)
    public ProductoDetalleDTO obtenerDetalleProducto(
            @PathVariable Long idProducto,
            jakarta.servlet.http.HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache");
        Producto producto = productoRepo.findById(idProducto)
            .filter(p -> !p.isEliminado())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Comerciante comerciante = comercianteRepo.findByProductoId(idProducto).orElse(null);
        if (comerciante == null || comerciante.isEliminado() || !comerciante.isCuentaHabilitada()) {
            throw new RuntimeException("Producto no disponible");
        }
        return new ProductoDetalleDTO(producto, comerciante);
    }

    @GetMapping("/comerciantes/{idComerciante}")
    @Transactional(readOnly = true)
    public ComerciantePerfilDTO obtenerPerfilComerciante(@PathVariable Long idComerciante) {
        Comerciante c = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        if (c.isEliminado() || !c.isCuentaHabilitada()) {
            throw new RuntimeException("Comerciante inactivo");
        }
        return new ComerciantePerfilDTO(c);
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
