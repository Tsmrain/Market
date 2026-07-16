package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.presentation.dto.LoginRequest;
import com.mutualista.mercado.repository.AdministradorMercadoRepository;
import com.mutualista.mercado.repository.ClienteRepository;
import com.mutualista.mercado.repository.ComercianteRepository;


import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final ComercianteRepository comercianteRepo;
    private final ClienteRepository clienteRepo;
    private final AdministradorMercadoRepository adminRepo;

    public AuthController(ComercianteRepository cRepo, ClienteRepository cliRepo, AdministradorMercadoRepository adminRepo) {
        this.comercianteRepo = cRepo;
        this.clienteRepo = cliRepo;
        this.adminRepo = adminRepo;
    }

    @PostMapping("/comerciantes/login")
    public ResponseEntity<?> loginComerciante(@RequestBody LoginRequest request) {
        return comercianteRepo.findByCiActivo(request.getCi())
            .filter(c -> c.validarPin(request.getPin()))
            .map(c -> {
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", c.getId());
                res.put("nombre", c.getNombre());
                res.put("rol", "COMERCIANTE");
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas")));
    }

    @PostMapping("/admins/login")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        // Database Admin check
        return adminRepo.findByCiAndEliminadoFalse(request.getCi())
            .filter(a -> a.validarPin(request.getPin()))
            .map(a -> {
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", a.getId());
                res.put("nombre", a.getNombre());
                res.put("rol", a.getRol()); // Devuelve "SUPERADMIN" o "ADMIN" según la Base de Datos
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas")));
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
        
        Map<String, Object> res = new HashMap<>();
        res.put("mensaje", "Cliente registrado");
        res.put("id", nuevo.getId());
        res.put("nombre", nuevo.getNombre());
        res.put("rol", "CLIENTE");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/clientes/login")
    public ResponseEntity<?> loginCliente(@RequestBody LoginRequest request) {
        return clienteRepo.findByCi(request.getCi())
            .filter(c -> c.validarPin(request.getPin()))
            .map(c -> {
                Map<String, Object> res = new HashMap<>();
                res.put("mensaje", "Exito");
                res.put("id", c.getId());
                res.put("nombre", c.getNombre());
                res.put("rol", "CLIENTE");
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas")));
    }
}
