package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Categoria;
import com.mutualista.mercado.domain.AdministradorAsociacion;
import com.mutualista.mercado.domain.repository.CategoriaRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/categorias")
@CrossOrigin(origins = "*")
public class AdminCategoriaController {

    private final CategoriaRepository categoriaRepo;
    private final AdministradorAsociacionRepository adminRepo;

    public AdminCategoriaController(CategoriaRepository categoriaRepo, AdministradorAsociacionRepository adminRepo) {
        this.categoriaRepo = categoriaRepo;
        this.adminRepo = adminRepo;
    }

    private boolean isSuperAdmin(String adminHeaderId) {
        if (adminHeaderId == null || adminHeaderId.trim().isEmpty()) {
            return false;
        }
        try {
            Long adminId = Long.parseLong(adminHeaderId);
            Optional<AdministradorAsociacion> adminOpt = adminRepo.findById(adminId);
            return adminOpt.isPresent() && "SUPERADMIN".equals(adminOpt.get().getRol());
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearCategoria(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @RequestBody Map<String, Object> payload) {
        if (!isSuperAdmin(adminHeaderId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado. Solo el Superadministrador puede realizar esta acción."));
        }

        String nombre = (String) payload.get("nombre");
        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre de la categoría es obligatorio."));
        }

        Categoria padre = null;
        Object padreIdObj = payload.get("idCategoriaPadre");
        if (padreIdObj != null) {
            try {
                Long padreId = Long.parseLong(padreIdObj.toString());
                padre = categoriaRepo.findById(padreId).orElse(null);
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        Categoria nueva = new Categoria(null, nombre.trim(), padre);
        categoriaRepo.save(nueva);
        return ResponseEntity.ok(Map.of("mensaje", "Categoría creada correctamente."));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> editarCategoria(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        if (!isSuperAdmin(adminHeaderId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado. Solo el Superadministrador puede realizar esta acción."));
        }

        return categoriaRepo.findById(id).map(cat -> {
            String nombre = payload.get("nombre");
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre de la categoría es obligatorio."));
            }
            cat.actualizarNombre(nombre.trim());
            categoriaRepo.save(cat);
            return ResponseEntity.ok(Map.of("mensaje", "Categoría actualizada correctamente."));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminarCategoria(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @PathVariable Long id) {
        if (!isSuperAdmin(adminHeaderId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado. Solo el Superadministrador puede realizar esta acción."));
        }

        if (!categoriaRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        categoriaRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada correctamente."));
    }
}
