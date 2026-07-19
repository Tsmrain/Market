package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.presentation.dto.ComercianteRecaudacionDTO;
import com.mutualista.mercado.presentation.dto.RegistrarPagoRequest;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.CuotaMensualRepository;
import com.mutualista.mercado.domain.repository.AuditoriaPagoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.MessageSource;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recaudacion")
@CrossOrigin(origins = "*")
public class RecaudacionController {

    private final AdministradorAsociacionRepository adminRepo;
    private final ComercianteRepository comercianteRepo;
    private final CuotaMensualRepository cuotaRepo;
    private final AuditoriaPagoRepository auditRepo;

    private final MessageSource messageSource;

    public RecaudacionController(AdministradorAsociacionRepository adminRepo,
                                 ComercianteRepository comercianteRepo,
                                 CuotaMensualRepository cuotaRepo,
                                 AuditoriaPagoRepository auditRepo,
                                 MessageSource messageSource) {
        this.adminRepo = adminRepo;
        this.comercianteRepo = comercianteRepo;
        this.cuotaRepo = cuotaRepo;
        this.auditRepo = auditRepo;
        this.messageSource = messageSource;
    }

    @GetMapping("/comerciantes")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarComerciantesAsociacion(
            @RequestHeader(value = "X-User-Id", required = false) String headerAdminId,
            @RequestParam(required = false) Long adminId,
            @RequestParam int mes,
            @RequestParam int anio) {

        Long idBuscado = null;
        if (headerAdminId != null && !headerAdminId.trim().isEmpty()) {
            try {
                idBuscado = Long.parseLong(headerAdminId);
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        if (idBuscado == null) {
            idBuscado = adminId;
        }

        if (idBuscado == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identificador de administrador ausente."));
        }

        Optional<AdministradorAsociacion> adminOpt = adminRepo.findById(idBuscado);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Administrador no encontrado."));
        }

        AdministradorAsociacion admin = adminOpt.get();
        if (admin.getAsociacion() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "El administrador no está asignado a ninguna asociación."));
        }

        // Listar comerciantes de la misma asociación
        List<Comerciante> comerciantes = comercianteRepo.findByAsociacionIdAndEliminadoFalse(admin.getAsociacion().getId());

        List<ComercianteRecaudacionDTO> dtos = comerciantes.stream().map(c -> {
            ComercianteRecaudacionDTO dto = new ComercianteRecaudacionDTO();
            dto.setId(c.getId());
            dto.setNombre(c.getNombre());
            dto.setCi(c.getCi());
            dto.setNumeroPuesto(c.getNumeroPuesto());
            dto.setTelefono(c.getTelefono());
            dto.setProximaFechaPago(c.obtenerProximaFechaPago());

            // Buscar cuota para el mes y año
            Optional<CuotaMensual> cuotaOpt = cuotaRepo.findByComercianteIdAndMesAndAnio(c.getId(), mes, anio);
            if (cuotaOpt.isPresent()) {
                CuotaMensual cuota = cuotaOpt.get();
                dto.setEstadoPago(cuota.getEstado().name());
                dto.setFechaPago(cuota.getFechaPago());
                dto.setMonto(cuota.getMonto());
            } else {
                dto.setEstadoPago(EstadoCuota.PENDIENTE.name());
                dto.setFechaPago(null);
                dto.setMonto(31.0);
            }
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/pagar/{comercianteId}")
    @Transactional
    public ResponseEntity<?> registrarPagoCuota(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @PathVariable Long comercianteId,
            @RequestParam int mes,
            @RequestParam int anio,
            @RequestParam(defaultValue = "31.0") Double monto,
            @RequestBody(required = false) RegistrarPagoRequest request) {

        Optional<Comerciante> comOpt = comercianteRepo.findById(comercianteId);
        if (comOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comerciante comerciante = comOpt.get();
        comerciante.setCuentaHabilitada(true);
        comercianteRepo.save(comerciante);

        String adminNombre = "Administrador";
        if (adminHeaderId != null && !adminHeaderId.trim().isEmpty()) {
            try {
                Long adminId = Long.parseLong(adminHeaderId);
                Optional<AdministradorAsociacion> adminOpt = adminRepo.findById(adminId);
                if (adminOpt.isPresent()) {
                    adminNombre = adminOpt.get().getNombre();
                }
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        String metodoPago = (request != null && request.getMetodoPago() != null) ? request.getMetodoPago() : "Efectivo";

        Optional<CuotaMensual> cuotaOpt = cuotaRepo.findByComercianteIdAndMesAndAnio(comercianteId, mes, anio);

        CuotaMercado(comerciante, mes, anio, monto, cuotaOpt, metodoPago, adminNombre);
        return ResponseEntity.ok(Map.of("mensaje", "Pago registrado exitosamente."));
    }

    private void CuotaMercado(Comerciante comerciante, int mes, int anio, Double monto, Optional<CuotaMensual> cuotaOpt, String metodoPago, String adminNombre) {
        CuotaMensual cuota;
        if (cuotaOpt.isPresent()) {
            cuota = cuotaOpt.get();
            cuota.registrarPago();
            if (monto != null) {
                cuota.setMonto(monto);
            }
        } else {
            cuota = new CuotaMensual(comerciante, mes, anio, monto);
            cuota.registrarPago();
        }
        cuota.setMetodoPago(metodoPago);
        cuota.setRegistradoPor(adminNombre);
        cuotaRepo.save(cuota);

        // Transaction Log de auditoria
        auditRepo.save(new AuditoriaPago(cuota, "REGISTRO", adminNombre, metodoPago));
    }

    @PutMapping("/anular/{comercianteId}")
    @Transactional
    public ResponseEntity<?> anularPagoCuota(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @PathVariable Long comercianteId,
            @RequestParam int mes,
            @RequestParam int anio,
            @RequestBody(required = false) com.mutualista.mercado.presentation.dto.AnularPagoRequest request) {

        if (adminHeaderId == null || adminHeaderId.trim().isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado."));
        }

        long adminId;
        try {
            adminId = Long.parseLong(adminHeaderId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Identificador de administrador inválido."));
        }

        Optional<AdministradorAsociacion> requesterOpt = adminRepo.findById(adminId);
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of("error", "Administrador no encontrado."));
        }

        Optional<Comerciante> comOpt = comercianteRepo.findById(comercianteId);
        if (comOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comerciante comerciante = comOpt.get();
        AdministradorAsociacion requester = requesterOpt.get();

        if (!"SUPERADMIN".equals(requester.getRol())) {
            // Validar aislamiento de tenencia para administradores locales
            if (requester.getAsociacion() == null || comerciante.getAsociacion() == null ||
                !requester.getAsociacion().getId().equals(comerciante.getAsociacion().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Acceso denegado: Aislamiento de tenencia violado."));
            }
        }

        Optional<CuotaMensual> cuotaOpt = cuotaRepo.findByComercianteIdAndMesAndAnio(comercianteId, mes, anio);
        if (cuotaOpt.isPresent()) {
            CuotaMensual cuota = cuotaOpt.get();

            // Bloqueo Antifraude de 24 Horas
            if (cuota.getFechaPago() != null) {
                Duration duration = Duration.between(cuota.getFechaPago(), LocalDateTime.now());
                if (duration.toHours() > 24) {
                    return ResponseEntity.badRequest().body(Map.of("error", messageSource.getMessage("rate.limit.error", null, org.springframework.context.i18n.LocaleContextHolder.getLocale())));
                }
            }

            String motivo = (request != null && request.getMotivo() != null) ? request.getMotivo() : "Sin motivo especificado";
            cuota.anularPago(motivo);
            cuota.setAnuladoPor(requester.getNombre());
            cuotaRepo.save(cuota);

            comerciante.setCuentaHabilitada(false);
            comercianteRepo.save(comerciante);

            // Transaction Log de auditoria
            auditRepo.save(new AuditoriaPago(cuota, "ANULACION", requester.getNombre(), motivo));

            return ResponseEntity.ok(Map.of("mensaje", "Pago de cuota anulado exitosamente."));
        }

        return ResponseEntity.notFound().build();
    }
}
