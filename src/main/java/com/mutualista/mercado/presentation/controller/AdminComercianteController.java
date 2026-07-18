package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.CuotaMensual;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.AsociacionRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.domain.repository.CuotaMensualRepository;
import com.mutualista.mercado.presentation.dto.NuevoComercianteRequest;
import com.mutualista.mercado.presentation.dto.EditarComercianteRequest;

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
    private final AsociacionRepository asociacionRepo;
    private final AdministradorAsociacionRepository adminRepo;
    private final CuotaMensualRepository cuotaRepo;
    private final com.mutualista.mercado.application.ParametroSistemaService paramService;

    public AdminComercianteController(ComercianteRepository repo, 
                                      AsociacionRepository asociacionRepo, 
                                      AdministradorAsociacionRepository adminRepo,
                                      CuotaMensualRepository cuotaRepo,
                                      com.mutualista.mercado.application.ParametroSistemaService paramService) { 
        this.comercianteRepo = repo; 
        this.asociacionRepo = asociacionRepo;
        this.adminRepo = adminRepo;
        this.cuotaRepo = cuotaRepo;
        this.paramService = paramService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarComerciantes(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId) {
        
        List<Comerciante> comerciantes;
        
        if (adminHeaderId != null && !adminHeaderId.trim().isEmpty()) {
            try {
                Long adminId = Long.parseLong(adminHeaderId);
                java.util.Optional<com.mutualista.mercado.domain.AdministradorAsociacion> adminOpt = adminRepo.findById(adminId);
                if (adminOpt.isPresent() && adminOpt.get().getAsociacion() != null) {
                    comerciantes = comercianteRepo.findByAsociacionIdAndEliminadoFalse(adminOpt.get().getAsociacion().getId());
                } else {
                    comerciantes = comercianteRepo.findByEliminadoFalse();
                }
            } catch (NumberFormatException e) {
                comerciantes = comercianteRepo.findByEliminadoFalse();
            }
        } else {
            comerciantes = comercianteRepo.findByEliminadoFalse();
        }

        return comerciantes.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", c.getId());
            map.put("ci", c.getCi());
            map.put("expedido", c.getExpedido());
            map.put("nombre", c.getNombre());
            map.put("telefono", c.getTelefono());
            map.put("numeroPuesto", c.getNumeroPuesto());
            map.put("cuentaHabilitada", c.isCuentaHabilitada());
            map.put("proximaFechaPago", c.obtenerProximaFechaPago());
            if (c.getAsociacion() != null) {
                map.put("asociacionId", c.getAsociacion().getId());
                map.put("asociacionNombre", c.getAsociacion().getNombre());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public Map<String, String> registrarComerciante(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @RequestBody NuevoComercianteRequest request) {
        String ci = request.getCi();
        String expedido = request.getExpedido();
        String pin = request.getPin();
        String nombre = request.getNombre();
        String telefono = request.getTelefono();
        String asociacionIdStr = request.getAsociacionId();
        String numeroPuesto = request.getNumeroPuesto();

        if (ci == null || expedido == null || pin == null || nombre == null || telefono == null || numeroPuesto == null) {
            throw new IllegalArgumentException("Todos los campos, incluyendo el Número de Puesto, son obligatorios.");
        }

        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            throw new IllegalArgumentException("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
        }

        if (comercianteRepo.findByCi(ci).isPresent()) {
            throw new RuntimeException("Ya existe un comerciante con ese CI.");
        }
        Comerciante nuevo = new Comerciante(ci, expedido, pin, nombre, telefono);
        nuevo.setNumeroPuesto(numeroPuesto);

        // Resolver Asociación automáticamente (de forma prioritaria a partir del administrador)
        final String[] adminNombreArr = new String[]{"Administrador"};
        if (adminHeaderId != null && !adminHeaderId.trim().isEmpty()) {
            try {
                adminRepo.findById(Long.parseLong(adminHeaderId)).ifPresent(admin -> {
                    if (admin.getAsociacion() != null) {
                        nuevo.setAsociacion(admin.getAsociacion());
                    }
                    adminNombreArr[0] = admin.getNombre();
                });
            } catch (NumberFormatException e) {
                // ignore
            }
        } else if (asociacionIdStr != null && !asociacionIdStr.trim().isEmpty()) {
            // Fallback para pruebas automatizadas si no viene el header
            asociacionRepo.findById(Long.parseLong(asociacionIdStr)).ifPresent(nuevo::setAsociacion);
        }

        nuevo.setCuentaHabilitada(true);
        comercianteRepo.save(nuevo);

        // Instanciar y guardar la primera cuota pagada del mes en curso (Patrón Creator)
        java.time.LocalDate hoy = java.time.LocalDate.now();
        int mesActual = hoy.getMonthValue();
        int anioActual = hoy.getYear();
        
        Double tarifa = paramService.obtenerTarifaSuscripcion();
        CuotaMensual cuotaInicial = new CuotaMensual(nuevo, mesActual, anioActual, tarifa);
        cuotaInicial.registrarPago(); // Pone estado PAGADO y fechaPago = ahora
        cuotaInicial.setMetodoPago("Efectivo");
        cuotaInicial.setRegistradoPor(adminNombreArr[0]);
        cuotaInicial.setFechaGeneracion(java.time.LocalDate.now());
        cuotaRepo.save(cuotaInicial);

        return Map.of("mensaje", "Comerciante registrado exitosamente.");
    }

    @PutMapping("/{idComerciante}")
    @Transactional
    public org.springframework.http.ResponseEntity<?> editarComerciante(
            @PathVariable Long idComerciante, 
            @RequestBody EditarComercianteRequest request) {
        Comerciante c = comercianteRepo.findById(idComerciante).orElseThrow();
        String telefono = request.getTelefono();
        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7."));
        }
        
        String ci = request.getCi();
        String expedido = request.getExpedido();
        if (ci == null || ci.trim().isEmpty() || expedido == null || expedido.trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El CI y la Expedición son obligatorios."));
        }

        // Control de duplicados: Buscar comerciante por CI
        java.util.Optional<Comerciante> existente = comercianteRepo.findByCi(ci);
        if (existente.isPresent() && !existente.get().getId().equals(idComerciante)) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "El carnet ingresado ya está registrado."));
        }

        c.actualizarDatos(ci, expedido, request.getNombre(), telefono, request.getPin());
        c.setNumeroPuesto(request.getNumeroPuesto());
        
        // Mantenemos la asociacion, cuentaHabilitada y eliminado actuales en la entidad.
        // Solo actualizamos la asociacion si se proporciona una nueva de manera explicita.
        String asociacionIdStr = request.getAsociacionId();
        if (asociacionIdStr != null && !asociacionIdStr.trim().isEmpty()) {
            asociacionRepo.findById(Long.parseLong(asociacionIdStr)).ifPresent(c::setAsociacion);
        }

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

    @PutMapping("/{idComerciante}/estado")
    @Transactional
    public org.springframework.http.ResponseEntity<?> cambiarEstadoLicencia(
            @RequestHeader(value = "X-User-Id", required = false) String adminHeaderId,
            @PathVariable Long idComerciante,
            @RequestParam boolean habilitado) {

        if (adminHeaderId == null || adminHeaderId.trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado."));
        }

        long adminId;
        try {
            adminId = Long.parseLong(adminHeaderId);
        } catch (NumberFormatException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", "Identificador de administrador inválido."));
        }

        java.util.Optional<com.mutualista.mercado.domain.AdministradorAsociacion> requesterOpt = adminRepo.findById(adminId);
        if (requesterOpt.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(403).body(Map.of("error", "Administrador no encontrado."));
        }

        java.util.Optional<Comerciante> comOpt = comercianteRepo.findById(idComerciante);
        if (comOpt.isEmpty()) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }

        Comerciante c = comOpt.get();
        com.mutualista.mercado.domain.AdministradorAsociacion requester = requesterOpt.get();
        if (!"SUPERADMIN".equals(requester.getRol())) {
            // Validar aislamiento de tenencia para administradores locales
            if (requester.getAsociacion() == null || c.getAsociacion() == null ||
                !requester.getAsociacion().getId().equals(c.getAsociacion().getId())) {
                return org.springframework.http.ResponseEntity.status(403).body(Map.of("error", "Acceso denegado: Aislamiento de tenencia violado."));
            }
        }

        c.setCuentaHabilitada(habilitado);
        comercianteRepo.save(c);
        return org.springframework.http.ResponseEntity.ok(Map.of("mensaje", "Estado de comerciante actualizado correctamente."));
    }
}
