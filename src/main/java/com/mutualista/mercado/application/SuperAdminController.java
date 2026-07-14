package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.AdministradorMercado;
import com.mutualista.mercado.repository.AdministradorMercadoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin/administradores")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private final AdministradorMercadoRepository adminRepo;

    public SuperAdminController(AdministradorMercadoRepository adminRepo) {
        this.adminRepo = adminRepo;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarAdministradores() {
        return adminRepo.findByEliminadoFalse().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("ci", a.getCi());
            map.put("nombre", a.getNombre());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public Map<String, String> registrarAdministrador(@RequestBody Map<String, String> payload) {
        String ci = payload.get("ci");
        String pin = payload.get("pin");
        String nombre = payload.get("nombre");

        if (ci == null || pin == null || nombre == null) {
            throw new IllegalArgumentException("Todos los campos son obligatorios.");
        }

        if (pin.length() != 4) {
            throw new IllegalArgumentException("El PIN debe tener exactamente 4 dígitos.");
        }

        if (adminRepo.findByCi(ci).isPresent()) {
            throw new RuntimeException("Ya existe un administrador con ese CI.");
        }

        AdministradorMercado nuevo = new AdministradorMercado(ci, pin, nombre);
        adminRepo.save(nuevo);
        return Map.of("mensaje", "Administrador registrado exitosamente.");
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, String> editarAdministrador(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        AdministradorMercado a = adminRepo.findById(id).orElseThrow();
        String pin = payload.get("pin");
        a.actualizarDatos(payload.get("nombre"), pin != null && !pin.isEmpty() ? pin : null);
        adminRepo.save(a);
        return Map.of("mensaje", "Administrador actualizado exitosamente.");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, String> darDeBajaAdministrador(@PathVariable Long id) {
        AdministradorMercado a = adminRepo.findById(id).orElseThrow();
        a.eliminarLogicamente();
        adminRepo.save(a);
        return Map.of("mensaje", "Administrador de mercado dado de baja.");
    }
}
