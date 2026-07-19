package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Categoria;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.presentation.dto.NuevoProductoRequest;
import com.mutualista.mercado.domain.repository.CategoriaRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;


import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.repository.UnidadMedidaMaestraRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/comerciantes")
public class CatalogoController {

    private final ComercianteRepository comercianteRepo;
    private final CategoriaRepository categoriaRepo;
    private final UnidadMedidaMaestraRepository unidadRepo;

    public CatalogoController(ComercianteRepository comercianteRepo, CategoriaRepository categoriaRepo, UnidadMedidaMaestraRepository unidadRepo) {
        this.comercianteRepo = comercianteRepo;
        this.categoriaRepo = categoriaRepo;
        this.unidadRepo = unidadRepo;
    }

    @PostMapping("/{idComerciante}/productos")
    @Transactional // Patrón de Transacción de base de datos
    public String registrarProducto(
            @PathVariable Long idComerciante,
            @RequestBody NuevoProductoRequest request) {

        // 1. Mediación: Buscar objetos en la base de datos
        Comerciante comerciante = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));

        Categoria categoria = categoriaRepo.findById(request.getIdCategoria())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // Validar Unidad de Medida contra el maestro
        String unidad = request.getUnidadMedida();
        String unidadLimpia = (unidad == null || unidad.trim().isEmpty()) ? "UNIDAD" : unidad.trim().toUpperCase();
        if (!unidadRepo.findByCodigo(unidadLimpia).isPresent()) {
            throw new IllegalArgumentException("La unidad de medida '" + unidadLimpia + "' no existe en el catálogo maestro.");
        }

        // Asignación de marca opcional con fallback a "Genérico"
        String marcaRaw = request.getMarca();
        String marcaLimpia = (marcaRaw == null || marcaRaw.trim().isEmpty()) ? "Genérico" : marcaRaw.trim();

        // 2. Creator: Delegar la lógica de instanciación al Dominio Puro
        Producto producto = comerciante.registrarProducto(request.getNombre(), request.getPrecio(), categoria, unidadLimpia);
        producto.setMarca(marcaLimpia);

        // 3. Guardar estado (El Producto se guarda por Cascada)
        comercianteRepo.save(comerciante);

        return "Producto registrado con éxito";
    }
}
