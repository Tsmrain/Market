package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Categoria;
import com.mutualista.mercado.repository.CategoriaRepository;


import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categorias")
@CrossOrigin(origins = "*")
public class AdminCategoriaController {

    private final CategoriaRepository categoriaRepo;
    public AdminCategoriaController(CategoriaRepository repo) { this.categoriaRepo = repo; }

    @PostMapping
    @Transactional
    public Map<String, String> crearCategoria(@RequestBody Map<String, String> payload) {
        String nombre = payload.get("nombre");
        String idPadreStr = payload.get("idCategoriaPadre");
        Categoria padre = (idPadreStr != null && !idPadreStr.isEmpty()) ? categoriaRepo.findById(Long.valueOf(idPadreStr)).orElse(null) : null;
        categoriaRepo.save(new Categoria(null, nombre, padre));
        return Map.of("mensaje", "Categoría creada exitosamente.");
    }

    @PutMapping("/{idCategoria}")
    @Transactional
    public Map<String, String> editarCategoria(@PathVariable Long idCategoria, @RequestBody Map<String, String> payload) {
        Categoria c = categoriaRepo.findById(idCategoria).orElseThrow();
        c.actualizarNombre(payload.get("nombre"));
        categoriaRepo.save(c);
        return Map.of("mensaje", "Categoría actualizada.");
    }

    @DeleteMapping("/{idCategoria}")
    @Transactional
    public Map<String, String> eliminarCategoria(@PathVariable Long idCategoria) {
        Categoria c = categoriaRepo.findById(idCategoria).orElseThrow();
        c.eliminarLogicamente();
        categoriaRepo.save(c);
        return Map.of("mensaje", "Categoría eliminada lógicamente.");
    }
}
