package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Asociacion;
import com.mutualista.mercado.presentation.dto.AsociacionDTO;
import com.mutualista.mercado.domain.repository.AsociacionRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin/asociaciones")
@CrossOrigin(origins = "*")
public class AsociacionController {

    private final AsociacionRepository asociacionRepo;
    private final ComercianteRepository comercianteRepo;

    public AsociacionController(AsociacionRepository asociacionRepo, 
                                ComercianteRepository comercianteRepo) {
        this.asociacionRepo = asociacionRepo;
        this.comercianteRepo = comercianteRepo;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AsociacionDTO> listarAsociaciones() {
        List<Asociacion> asociaciones = asociacionRepo.findAll();
        return asociaciones.stream().map(asoc -> {
            return new AsociacionDTO(asoc.getId(), asoc.getNombre(), "");
        }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearAsociacion(@RequestBody AsociacionDTO payload) {
        if (payload.getNombre() == null || payload.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio."));
        }
        Asociacion nueva = new Asociacion(payload.getNombre().trim());
        asociacionRepo.save(nueva);
        return ResponseEntity.ok(Map.of("mensaje", "Asociación creada exitosamente.", "id", nueva.getId()));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> actualizarAsociacion(@PathVariable Long id, @RequestBody AsociacionDTO payload) {
        return asociacionRepo.findById(id).map(asoc -> {
            if (payload.getNombre() == null || payload.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio."));
            }
            asoc.actualizar(payload.getNombre().trim());
            asociacionRepo.save(asoc);
            return ResponseEntity.ok(Map.of("mensaje", "Asociación actualizada correctamente."));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminarAsociacion(@PathVariable Long id) {
        if (!asociacionRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Desasociar comerciantes antes de eliminar
        comercianteRepo.findByEliminadoFalse().stream()
                .filter(c -> c.getAsociacion() != null && c.getAsociacion().getId().equals(id))
                .forEach(c -> {
                    c.setAsociacion(null);
                    comercianteRepo.save(c);
                });

        asociacionRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Asociación registrada/eliminada correctamente."));
    }
}
