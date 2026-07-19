package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.AdministradorAsociacion;
import com.mutualista.mercado.presentation.dto.LoginRequest;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.infrastructure.security.TokenProvider;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final ComercianteRepository comercianteRepo;
    private final ClienteRepository clienteRepo;
    private final AdministradorAsociacionRepository adminRepo;
    private final TokenProvider tokenProvider;

    public AuthController(ComercianteRepository cRepo,
                          ClienteRepository cliRepo,
                          AdministradorAsociacionRepository adminRepo,
                          TokenProvider tokenProvider) {
        this.comercianteRepo = cRepo;
        this.clienteRepo = cliRepo;
        this.adminRepo = adminRepo;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping({"/login", "/comerciantes/login", "/admins/login"})
    public ResponseEntity<?> loginUnified(@RequestBody LoginRequest request) {
        // 1. Buscar primero en ComercianteRepository (Activo)
        Optional<Comerciante> comercianteOpt = comercianteRepo.findByCiActivo(request.getCi());
        if (comercianteOpt.isPresent()) {
            Comerciante c = comercianteOpt.get();
            if (c.validarPin(request.getPin())) {
                String token = tokenProvider.generarToken(c.getUsuarioId(), "COMERCIANTE");
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", c.getId());
                res.put("nombre", c.getNombre());
                res.put("rol", "COMERCIANTE");
                res.put("token", token);
                return ResponseEntity.ok(res);
            }
        }

        // 2. Buscar si no en AdministradorAsociacionRepository (Activo)
        Optional<AdministradorAsociacion> adminOpt = adminRepo.findByCiAndEliminadoFalse(request.getCi());
        if (adminOpt.isPresent()) {
            AdministradorAsociacion a = adminOpt.get();
            if (a.validarPassword(request.getPin())) {
                String token = tokenProvider.generarToken(a.getUsuarioId(), a.getRol());
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", a.getId());
                res.put("nombre", a.getNombre());
                res.put("rol", a.getRol()); // SUPERADMIN o ADMIN_ASOCIACION
                res.put("token", token);
                if ("ADMIN_ASOCIACION".equals(a.getRol()) && a.getAsociacion() != null) {
                    res.put("nombreAsociacion", a.getAsociacion().getNombre());
                }
                return ResponseEntity.ok(res);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas"));
    }

    // Registro y Login de Clientes
    @PostMapping("/clientes/registro")
    public ResponseEntity<?> registrarCliente(@RequestBody Map<String, String> payload) {
        String telefono = payload.get("celular");
        if (telefono == null || !telefono.matches("^[67]\\d{7}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7."));
        }

        if(clienteRepo.findByCi(payload.get("ci")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El CI ya está registrado."));
        }
        Cliente nuevo = new Cliente(payload.get("ci"), payload.get("expedido"), payload.get("pin"), payload.get("nombre"), payload.get("celular"));
        clienteRepo.save(nuevo);

        String token = tokenProvider.generarToken(nuevo.getUsuarioId(), "CLIENTE");
        Map<String, Object> res = new HashMap<>();
        res.put("mensaje", "Cliente registrado");
        res.put("id", nuevo.getId());
        res.put("nombre", nuevo.getNombre());
        res.put("rol", "CLIENTE");
        res.put("token", token);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/clientes/login")
    public ResponseEntity<?> loginCliente(@RequestBody LoginRequest request) {
        return clienteRepo.findByCi(request.getCi())
            .filter(c -> c.validarPin(request.getPin()))
            .map(c -> {
                String token = tokenProvider.generarToken(c.getUsuarioId(), "CLIENTE");
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", c.getId());
                res.put("nombre", c.getNombre());
                res.put("rol", "CLIENTE");
                res.put("token", token);
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas")));
    }
}
