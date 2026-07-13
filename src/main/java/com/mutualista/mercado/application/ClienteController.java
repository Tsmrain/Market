package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.repository.ClienteRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes/{idCliente}")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteRepository clienteRepo;
    public ClienteController(ClienteRepository repo) { this.clienteRepo = repo; }

    @GetMapping
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerPerfil(@PathVariable Long idCliente) {
        Cliente c = clienteRepo.findById(idCliente).orElseThrow();
        return Map.of("ci", c.getCi(), "nombre", c.getNombre(), "celular", c.getCelular());
    }

    @PutMapping
    @Transactional
    public Map<String, String> actualizarPerfil(@PathVariable Long idCliente, @RequestBody Map<String, String> payload) {
        Cliente c = clienteRepo.findById(idCliente).orElseThrow();
        String celular = payload.get("celular");
        if (celular != null && !celular.matches("^[67]\\d{7}$")) {
            throw new IllegalArgumentException("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
        }
        c.actualizarPerfil(payload.get("nombre"), celular, payload.get("pin"));
        clienteRepo.save(c);
        return Map.of("mensaje", "Perfil actualizado con éxito.");
    }
}
