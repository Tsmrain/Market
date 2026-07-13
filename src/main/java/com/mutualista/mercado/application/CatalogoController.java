package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/comerciantes")
public class CatalogoController {

    private final ComercianteRepository comercianteRepo;
    private final CategoriaRepository categoriaRepo;

    public CatalogoController(ComercianteRepository comercianteRepo, CategoriaRepository categoriaRepo) {
        this.comercianteRepo = comercianteRepo;
        this.categoriaRepo = categoriaRepo;
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

        // 2. Creator: Delegar la lógica de instanciación al Dominio Puro
        comerciante.registrarProducto(request.getNombre(), request.getPrecio(), categoria);

        // 3. Guardar estado (El Producto se guarda por Cascada)
        comercianteRepo.save(comerciante);

        return "Producto registrado con éxito";
    }
}
