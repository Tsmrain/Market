package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.AdministradorMercado;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.repository.AdministradorMercadoRepository;
import com.mutualista.mercado.repository.UnidadMedidaMaestraRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private final AdministradorMercadoRepository adminRepo;
    private final UnidadMedidaMaestraRepository unidadRepo;

    public SuperAdminController(AdministradorMercadoRepository adminRepo, UnidadMedidaMaestraRepository unidadRepo) {
        this.adminRepo = adminRepo;
        this.unidadRepo = unidadRepo;
    }

    // ==========================================
    // CRUD ADMINISTRADORES
    // ==========================================

    @GetMapping("/administradores")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarAdministradores() {
        return adminRepo.findByEliminadoFalse().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("ci", a.getCi());
            map.put("expedido", a.getExpedido());
            map.put("nombre", a.getNombre());
            map.put("telefono", a.getTelefono());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/administradores")
    @Transactional
    public Map<String, String> registrarAdministrador(@RequestBody Map<String, String> payload) {
        String ci = payload.get("ci");
        String expedido = payload.get("expedido");
        String pin = payload.get("pin");
        String nombre = payload.get("nombre");
        String telefono = payload.get("telefono");

        if (ci == null || expedido == null || pin == null || nombre == null || telefono == null) {
            throw new IllegalArgumentException("Todos los campos son obligatorios.");
        }

        if (pin.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña/PIN no puede estar vacía.");
        }

        if (adminRepo.findByCi(ci).isPresent()) {
            throw new RuntimeException("Ya existe un administrador con ese CI.");
        }

        AdministradorMercado nuevo = new AdministradorMercado(ci, expedido, pin, nombre, telefono);
        adminRepo.save(nuevo);
        return Map.of("mensaje", "Administrador registrado exitosamente.");
    }

    @PutMapping("/administradores/{id}")
    @Transactional
    public Map<String, String> editarAdministrador(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        AdministradorMercado a = adminRepo.findById(id).orElseThrow();
        String pin = payload.get("pin");
        String telefono = payload.get("telefono");
        a.actualizarDatos(payload.get("nombre"), pin != null && !pin.isEmpty() ? pin : null, telefono);
        adminRepo.save(a);
        return Map.of("mensaje", "Administrador actualizado exitosamente.");
    }

    @DeleteMapping("/administradores/{id}")
    @Transactional
    public Map<String, String> darDeBajaAdministrador(@PathVariable Long id) {
        AdministradorMercado a = adminRepo.findById(id).orElseThrow();
        a.eliminarLogicamente();
        adminRepo.save(a);
        return Map.of("mensaje", "Administrador de mercado dado de baja.");
    }

    // ==========================================
    // CRUD UNIDADES DE MEDIDA (Datos Maestros)
    // ==========================================

    @GetMapping("/unidades")
    @Transactional(readOnly = true)
    public List<UnidadMedidaMaestra> listarUnidades() {
        return unidadRepo.findAll();
    }

    @PostMapping("/unidades")
    @Transactional
    public UnidadMedidaMaestra crearUnidad(@RequestBody Map<String, Object> payload) {
        String codigo = (String) payload.get("codigo");
        String nombre = (String) payload.get("nombre");
        boolean admiteDecimales = Boolean.parseBoolean(payload.get("admiteDecimales").toString());

        if (codigo == null || codigo.trim().isEmpty() || nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El código y nombre son obligatorios.");
        }

        String codigoFormateado = codigo.trim().toUpperCase();
        if (unidadRepo.findByCodigo(codigoFormateado).isPresent()) {
            throw new RuntimeException("Ya existe una unidad de medida con el código: " + codigoFormateado);
        }

        UnidadMedidaMaestra nueva = new UnidadMedidaMaestra(codigoFormateado, nombre, admiteDecimales);
        return unidadRepo.save(nueva);
    }

    @PutMapping("/unidades/{id}")
    @Transactional
    public UnidadMedidaMaestra actualizarUnidad(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        UnidadMedidaMaestra uni = unidadRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada"));

        String nombre = (String) payload.get("nombre");
        boolean admiteDecimales = Boolean.parseBoolean(payload.get("admiteDecimales").toString());

        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }

        uni.actualizar(nombre, admiteDecimales);
        return unidadRepo.save(uni);
    }

    @DeleteMapping("/unidades/{id}")
    @Transactional
    public Map<String, String> eliminarUnidad(@PathVariable Long id) {
        UnidadMedidaMaestra uni = unidadRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada"));
        unidadRepo.delete(uni);
        return Map.of("mensaje", "Unidad de medida eliminada correctamente.");
    }
}
