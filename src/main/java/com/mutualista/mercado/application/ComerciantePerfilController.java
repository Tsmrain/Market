package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.repository.ComercianteRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/panel/comerciantes/{idComerciante}/perfil")
@CrossOrigin(origins = "*")
public class ComerciantePerfilController {

    private final ComercianteRepository comercianteRepo;

    public ComerciantePerfilController(ComercianteRepository comercianteRepo) {
        this.comercianteRepo = comercianteRepo;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ComerciantePerfilDTO obtenerPerfil(@PathVariable Long idComerciante) {
        Comerciante c = comercianteRepo.findById(idComerciante)
            .orElseThrow(() -> new RuntimeException("Comerciante no encontrado"));
        return new ComerciantePerfilDTO(c);
    }

    @PutMapping
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
}
