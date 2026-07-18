package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.AdministradorAsociacion;
import com.mutualista.mercado.domain.Asociacion;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.CuotaMensual;
import com.mutualista.mercado.domain.EstadoCuota;
import com.mutualista.mercado.presentation.dto.LiquidacionGlobalDTO;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.domain.repository.AsociacionRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.CuotaMensualRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin/administradores")
@CrossOrigin(origins = "*")
public class AdministradorAsociacionController {

    private final AdministradorAsociacionRepository adminRepo;
    private final AsociacionRepository asociacionRepo;
    private final ComercianteRepository comercianteRepo;
    private final CuotaMensualRepository cuotaRepo;

    public AdministradorAsociacionController(AdministradorAsociacionRepository adminRepo, 
                                             AsociacionRepository asociacionRepo,
                                             ComercianteRepository comercianteRepo,
                                             CuotaMensualRepository cuotaRepo) {
        this.adminRepo = adminRepo;
        this.asociacionRepo = asociacionRepo;
        this.comercianteRepo = comercianteRepo;
        this.cuotaRepo = cuotaRepo;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarAdministradores() {
        return adminRepo.findByEliminadoFalse().stream()
                .filter(a -> "ADMIN_ASOCIACION".equals(a.getRol()))
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("ci", a.getCi());
                    map.put("expedido", a.getExpedido());
                    map.put("nombre", a.getNombre());
                    map.put("telefono", a.getTelefono());
                    if (a.getAsociacion() != null) {
                        map.put("asociacionId", a.getAsociacion().getId());
                        map.put("asociacionNombre", a.getAsociacion().getNombre());
                    }
                    return map;
                }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrarAdministrador(@RequestBody Map<String, String> payload) {
        String ci = payload.get("ci");
        String expedido = payload.get("expedido");
        String pin = payload.get("pin"); // maps to password
        String nombre = payload.get("nombre");
        String telefono = payload.get("telefono");
        String asociacionIdStr = payload.get("asociacionId");

        if (ci == null || expedido == null || pin == null || nombre == null || telefono == null || asociacionIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos, incluyendo la Asociación, son obligatorios."));
        }

        if (adminRepo.findByCi(ci).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un administrador con ese CI."));
        }

        Optional<Asociacion> asocOpt = asociacionRepo.findById(Long.parseLong(asociacionIdStr));
        if (asocOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Asociación no encontrada."));
        }

        AdministradorAsociacion nuevo = new AdministradorAsociacion(
                ci,
                expedido,
                pin,
                nombre,
                telefono,
                asocOpt.get()
        );
        adminRepo.save(nuevo);
        return ResponseEntity.ok(Map.of("mensaje", "Administrador registrado exitosamente."));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> editarAdministrador(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return adminRepo.findById(id).map(a -> {
            String nombre = payload.get("nombre");
            String pin = payload.get("pin");
            String telefono = payload.get("telefono");
            String asociacionIdStr = payload.get("asociacionId");

            if (nombre == null || telefono == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre y teléfono son obligatorios."));
            }

            a.actualizarDatos(nombre, pin, telefono);

            if (asociacionIdStr != null && !asociacionIdStr.trim().isEmpty()) {
                asociacionRepo.findById(Long.parseLong(asociacionIdStr)).ifPresent(a::setAsociacion);
            }

            adminRepo.save(a);
            return ResponseEntity.ok(Map.of("mensaje", "Administrador actualizado exitosamente."));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> darDeBajaAdministrador(@PathVariable Long id) {
        return adminRepo.findById(id).map(a -> {
            a.eliminarLogicamente();
            adminRepo.save(a);
            return ResponseEntity.ok(Map.of("mensaje", "Administrador dado de baja."));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/recaudacion/resumen")
    @Transactional(readOnly = true)
    public List<LiquidacionGlobalDTO> getLiquidacionesGlobales(@RequestParam int mes, @RequestParam int anio) {
        List<Asociacion> asociaciones = asociacionRepo.findAll();
        List<LiquidacionGlobalDTO> res = new ArrayList<>();
        for (Asociacion asoc : asociaciones) {
            List<Comerciante> comerciantes = comercianteRepo.findByAsociacionIdAndEliminadoFalse(asoc.getId());
            int pagados = 0;
            int pendientes = 0;
            double totalRecaudado = 0.0;
            for (Comerciante c : comerciantes) {
                Optional<CuotaMensual> cuotaOpt = cuotaRepo.findByComercianteIdAndMesAndAnio(c.getId(), mes, anio);
                if (cuotaOpt.isPresent() && cuotaOpt.get().getEstado() == EstadoCuota.PAGADO) {
                    pagados++;
                    totalRecaudado += cuotaOpt.get().getMonto();
                } else {
                    pendientes++;
                }
            }
            res.add(new LiquidacionGlobalDTO(asoc.getId(), asoc.getNombre(), pagados, pendientes, totalRecaudado));
        }
        return res;
    }
}
