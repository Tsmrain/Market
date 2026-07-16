package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.repository.ComercianteRepository;


import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/comerciantes")
@CrossOrigin(origins = "*")
public class AdminComercianteController {

    private final ComercianteRepository comercianteRepo;
    public AdminComercianteController(ComercianteRepository repo) { this.comercianteRepo = repo; }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarComerciantes() {
        return comercianteRepo.findByEliminadoFalse().stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", c.getId());
            map.put("ci", c.getCi());
            map.put("expedido", c.getExpedido());
            map.put("nombre", c.getNombre());
            map.put("telefono", c.getTelefono());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public Map<String, String> registrarComerciante(@RequestBody Map<String, String> payload) {
        String ci = payload.get("ci");
        String expedido = payload.get("expedido");
        String pin = payload.get("pin");
        String nombre = payload.get("nombre");
        String telefono = payload.get("telefono");

        if (ci == null || expedido == null || pin == null || nombre == null || telefono == null) {
            throw new IllegalArgumentException("Todos los campos son obligatorios.");
        }

        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            throw new IllegalArgumentException("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
        }

        if (comercianteRepo.findByCi(ci).isPresent()) {
            throw new RuntimeException("Ya existe un comerciante con ese CI.");
        }
        Comerciante nuevo = new Comerciante(ci, expedido, pin, nombre, telefono);
        comercianteRepo.save(nuevo);
        return Map.of("mensaje", "Comerciante registrado exitosamente.");
    }

    @PutMapping("/{idComerciante}")
    @Transactional
    public org.springframework.http.ResponseEntity<?> editarComerciante(@PathVariable Long idComerciante, @RequestBody Map<String, String> payload) {
        Comerciante c = comercianteRepo.findById(idComerciante).orElseThrow();
        String telefono = payload.get("telefono");
        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7."));
        }
        
        String ci = payload.get("ci");
        String expedido = payload.get("expedido");
        if (ci == null || ci.trim().isEmpty() || expedido == null || expedido.trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El CI y la Expedición son obligatorios."));
        }

        // Control de duplicados: Buscar comerciante por CI
        java.util.Optional<Comerciante> existente = comercianteRepo.findByCi(ci);
        if (existente.isPresent() && !existente.get().getId().equals(idComerciante)) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El carnet ingresado ya está registrado."));
        }

        c.actualizarDatos(ci, expedido, payload.get("nombre"), telefono, payload.get("pin"));
        comercianteRepo.save(c);
        return org.springframework.http.ResponseEntity.ok(Map.of("mensaje", "Comerciante actualizado exitosamente."));
    }

    @DeleteMapping("/{idComerciante}")
    @Transactional
    public Map<String, String> darDeBajaComerciante(@PathVariable Long idComerciante) {
        Comerciante c = comercianteRepo.findById(idComerciante).orElseThrow();
        c.eliminarLogicamente(); // Elimina al comerciante y en cascada a sus productos
        comercianteRepo.save(c);
        return Map.of("mensaje", "Comerciante y sus productos dados de baja.");
    }
}
