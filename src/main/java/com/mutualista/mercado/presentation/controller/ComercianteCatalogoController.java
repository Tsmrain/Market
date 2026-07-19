package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.application.GestionarProductoService;
import com.mutualista.mercado.presentation.dto.EditarProductoRequestDTO;
import com.mutualista.mercado.presentation.dto.ProductoDetalleDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/panel/comerciantes/{idComerciante}/productos")
@CrossOrigin(origins = "*")
public class ComercianteCatalogoController {

    private final GestionarProductoService gestionarProductoService;

    public ComercianteCatalogoController(GestionarProductoService service) {
        this.gestionarProductoService = service;
    }

    @GetMapping
    public List<Map<String, Object>> listarMisProductos(@PathVariable Long idComerciante) {
        return gestionarProductoService.findByComercianteIdAndEliminadoFalse(idComerciante)
            .stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("nombre", p.getNombre());
                map.put("precio", p.getPrecio());
                map.put("estaDisponible", p.isEstaDisponible());
                return map;
            }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> agregarProducto(
            @PathVariable Long idComerciante,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") double precio,
            @RequestParam("idCategoria") Long idCategoria,
            @RequestParam(value = "unidadMedida", required = false, defaultValue = "UNIDAD") String unidadMedida,
            @RequestParam(value = "descripcion", required = false, defaultValue = "") String descripcion,
            @RequestParam(value = "marca", required = false, defaultValue = "") String marca,
            @RequestParam("archivos") MultipartFile[] archivos) {

        gestionarProductoService.registrarProducto(idComerciante, nombre, precio, idCategoria, unidadMedida, descripcion, marca, archivos);
        return ResponseEntity.ok(Map.of("mensaje", "Producto registrado exitosamente."));
    }

    @PutMapping("/{idProducto}/disponibilidad")
    public ResponseEntity<Map<String, String>> alternarDisponibilidad(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto) {
        gestionarProductoService.alternarDisponibilidad(idComerciante, idProducto);
        return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado."));
    }

    @DeleteMapping("/{idProducto}")
    public Map<String, String> eliminarProducto(@PathVariable Long idComerciante, @PathVariable Long idProducto) {
        throw new UnsupportedOperationException("Borrado fisico deshabilitado. Use la transicion de estado de archivar.");
    }

    @PutMapping("/{idProducto}/archivar")
    public ResponseEntity<Map<String, String>> archivarProducto(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto) {
        gestionarProductoService.archivarProducto(idComerciante, idProducto);
        return ResponseEntity.ok(Map.of("mensaje", "Producto archivado exitosamente."));
    }

    @PutMapping("/{idProducto}")
    public ResponseEntity<ProductoDetalleDTO> editarProducto(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @RequestBody EditarProductoRequestDTO dto) {
        ProductoDetalleDTO respuesta = gestionarProductoService.actualizarProducto(idComerciante, idProducto, dto);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/{idProducto}/multimedia")
    public ResponseEntity<List<Map<String, Object>>> agregarMultimedia(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @RequestParam("archivos") MultipartFile[] archivos) {

        var galeria = gestionarProductoService.agregarMultimedia(idComerciante, idProducto, archivos);
        List<Map<String, Object>> respuesta = galeria.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("url", m.getUrl());
            map.put("tipo", m.getTipoArchivo());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{idProducto}/multimedia/{idMultimedia}")
    public ResponseEntity<List<Map<String, Object>>> eliminarMultimedia(
            @PathVariable Long idComerciante,
            @PathVariable Long idProducto,
            @PathVariable Long idMultimedia) {

        var galeria = gestionarProductoService.eliminarMultimedia(idComerciante, idProducto, idMultimedia);
        List<Map<String, Object>> respuesta = galeria.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("url", m.getUrl());
            map.put("tipo", m.getTipoArchivo());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(respuesta);
    }
}
