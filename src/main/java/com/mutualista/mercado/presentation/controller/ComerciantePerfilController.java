package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.CuotaMensual;
import com.mutualista.mercado.presentation.dto.ComerciantePerfilDTO;
import com.mutualista.mercado.presentation.dto.HistorialFacturasResponse;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.CuotaMensualRepository;
import com.mutualista.mercado.domain.repository.AuditoriaPagoRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class ComerciantePerfilController {

    private final ComercianteRepository comercianteRepo;
    private final CuotaMensualRepository cuotaRepo;
    private final AuditoriaPagoRepository auditRepo;

    public ComerciantePerfilController(ComercianteRepository comercianteRepo,
                                       CuotaMensualRepository cuotaRepo,
                                       AuditoriaPagoRepository auditRepo) {
        this.comercianteRepo = comercianteRepo;
        this.cuotaRepo = cuotaRepo;
        this.auditRepo = auditRepo;
    }

    @GetMapping("/api/panel/comerciantes/{idComerciante}/perfil")
    @Transactional(readOnly = true)
    public ComerciantePerfilDTO obtenerPerfil(@PathVariable Long idComerciante) {
        Comerciante c = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        return new ComerciantePerfilDTO(c);
    }

    @PutMapping("/api/panel/comerciantes/{idComerciante}/perfil")
    @Transactional
    public ComerciantePerfilDTO actualizarPerfil(@PathVariable Long idComerciante, @RequestBody ComerciantePerfilDTO dto) {
        Comerciante c = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));

        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty() ||
            dto.getTelefono() == null || dto.getTelefono().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del comerciante y el teléfono de contacto son obligatorios.");
        }

        c.actualizarPerfil(
            dto.getNombre().trim(),
            dto.getTelefono().trim(),
            dto.getNumeroPuesto() != null ? dto.getNumeroPuesto().trim() : null
        );
        comercianteRepo.save(c);
        return new ComerciantePerfilDTO(c);
    }

    @GetMapping("/api/portal/comerciantes/mis-facturas")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerMisFacturas(@RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        if (headerUserId == null || headerUserId.trim().isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado."));
        }
        try {
            Long comercianteId = Long.parseLong(headerUserId);
            Comerciante comerciante = comercianteRepo.findById(comercianteId)
                .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));

            List<CuotaMensual> cuotas = cuotaRepo.findByComercianteIdOrderByAnioDescMesDesc(comercianteId);

            List<Map<String, Object>> facturas = cuotas.stream().map(c -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", c.getId());
                map.put("mes", c.getMes());
                map.put("anio", c.getAnio());
                map.put("monto", c.getMonto());
                map.put("estado", c.getEstado().name());
                map.put("fechaPago", c.getFechaPago());
                map.put("motivoAnulacion", c.getMotivoAnulacion());
                map.put("metodoPago", c.getMetodoPago());
                map.put("registradoPor", c.getRegistradoPor());
                map.put("anuladoPor", c.getAnuladoPor());

                // Mapear historial de AuditoriaPago (Transaction Log) para transparencia
                List<Map<String, Object>> auditLogs = auditRepo.findByCuotaIdOrderByFechaHoraDesc(c.getId()).stream().map(a -> {
                    Map<String, Object> am = new java.util.HashMap<>();
                    am.put("id", a.getId());
                    am.put("accion", a.getAccion());
                    am.put("actor", a.getActor());
                    am.put("fechaHora", a.getFechaHora());
                    am.put("detalle", a.getDetalle());
                    return am;
                }).collect(Collectors.toList());
                map.put("auditorias", auditLogs);

                return map;
            }).collect(Collectors.toList());

            String proximaFechaPago = comerciante.obtenerProximaFechaPago();
            HistorialFacturasResponse response = new HistorialFacturasResponse(facturas, proximaFechaPago);

            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identificador de comerciante inválido."));
        }
    }
}
