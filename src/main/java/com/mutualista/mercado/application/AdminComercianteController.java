package com.mutualista.mercado.application;

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
            map.put("nombre", c.getNombre());
            map.put("telefono", c.getTelefono());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public Map<String, String> registrarComerciante(@RequestBody Map<String, String> payload) {
        String ci = payload.get("ci");
        String pin = payload.get("pin");
        String nombre = payload.get("nombre");
        String telefono = payload.get("telefono");

        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            throw new IllegalArgumentException("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
        }

        if(comercianteRepo.findByCi(ci).isPresent()) {
            throw new RuntimeException("Ya existe un comerciante con ese CI");
        }
        Comerciante nuevo = new Comerciante(ci, pin, nombre, telefono);
        comercianteRepo.save(nuevo);
        return Map.of("mensaje", "Comerciante registrado exitosamente.");
    }

    @PutMapping("/{idComerciante}")
    @Transactional
    public Map<String, String> editarComerciante(@PathVariable Long idComerciante, @RequestBody Map<String, String> payload) {
        Comerciante c = comercianteRepo.findById(idComerciante).orElseThrow();
        String telefono = payload.get("telefono");
        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            throw new IllegalArgumentException("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
        }
        // Nota: NO se actualiza el CI.
        c.actualizarDatos(payload.get("nombre"), telefono, payload.get("pin"));
        comercianteRepo.save(c);
        return Map.of("mensaje", "Comerciante actualizado exitosamente.");
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
