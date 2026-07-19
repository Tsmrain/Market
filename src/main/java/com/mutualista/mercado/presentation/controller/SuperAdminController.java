package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.domain.ParametroSistema;
import com.mutualista.mercado.domain.DomainValidationException;
import com.mutualista.mercado.domain.repository.UnidadMedidaMaestraRepository;
import com.mutualista.mercado.domain.repository.ParametroSistemaRepository;
import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private final UnidadMedidaMaestraRepository unidadRepo;
    private final ParametroSistemaRepository paramRepo;

    public SuperAdminController(UnidadMedidaMaestraRepository unidadRepo, ParametroSistemaRepository paramRepo) {
        this.unidadRepo = unidadRepo;
        this.paramRepo = paramRepo;
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
            .orElseThrow(() -> new DomainValidationException("Unidad de medida no encontrada."));

        String nuevoCodigo = payload.get("codigo") != null ? payload.get("codigo").toString() : null;
        String nuevoNombre = payload.get("nombre") != null ? payload.get("nombre").toString() : null;
        boolean admiteDecimales = payload.get("admiteDecimales") != null
            && Boolean.parseBoolean(payload.get("admiteDecimales").toString());

        // GRASP: Information Expert — delegar validación al dominio
        uni.actualizarDatos(nuevoCodigo, nuevoNombre);
        // Ajustar flag admiteDecimales (no es una regla de negocio compleja, es config)
        uni.actualizar(uni.getNombre(), admiteDecimales);

        try {
            unidadRepo.save(uni);
            unidadRepo.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new DomainValidationException("Ya existe otra unidad de medida con el código '" + (nuevoCodigo != null ? nuevoCodigo.toUpperCase() : "") + "'. El código debe ser único.");
        }
        return uni;
    }

    @DeleteMapping("/unidades/{id}")
    @Transactional
    public Map<String, String> eliminarUnidad(@PathVariable Long id) {
        UnidadMedidaMaestra uni = unidadRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada"));
        unidadRepo.delete(uni);
        return Map.of("mensaje", "Unidad de medida eliminada correctamente.");
    }

    // ==========================================
    // PARÁMETROS DEL SISTEMA
    // ==========================================

    @GetMapping("/parametros/{clave}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerParametro(@PathVariable String clave) {
        return paramRepo.findById(clave)
            .map(p -> ResponseEntity.ok(p))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/parametros/{clave}")
    @Transactional
    public ResponseEntity<?> actualizarParametro(
            @PathVariable String clave,
            @RequestBody Map<String, String> payload) {

        String valor = payload.get("valor");
        if (valor == null || valor.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El valor del parámetro es obligatorio."));
        }

        ParametroSistema param = paramRepo.findById(clave)
            .orElseGet(() -> new ParametroSistema(clave, valor));
        param.setValor(valor.trim());
        paramRepo.save(param);
        return ResponseEntity.ok(param);
    }
}
