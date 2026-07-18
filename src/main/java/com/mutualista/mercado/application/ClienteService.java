package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.AdministradorAsociacion;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepo;
    private final ComercianteRepository comercianteRepo;
    private final AdministradorAsociacionRepository adminRepo;

    public ClienteService(ClienteRepository clienteRepo, 
                          ComercianteRepository comercianteRepo, 
                          AdministradorAsociacionRepository adminRepo) {
        this.clienteRepo = clienteRepo;
        this.comercianteRepo = comercianteRepo;
        this.adminRepo = adminRepo;
    }

    @Transactional
    public Cliente obtenerOCrearClienteSombra(Long usuarioId, String nombre) {
        // 1. Validar si ya es un cliente nativo
        Optional<Cliente> nativeCli = clienteRepo.findByUsuarioId(usuarioId);
        if (nativeCli.isPresent()) {
            return nativeCli.get();
        }

        // 2. Si no existe, averiguar si es Comerciante
        Optional<Comerciante> merchant = comercianteRepo.findByUsuarioId(usuarioId);
        String ci = "shadow_" + usuarioId;
        String exp = "SC";
        String cel = "00000000";
        if (merchant.isPresent()) {
            ci = merchant.get().getCi();
            exp = merchant.get().getExpedido();
            cel = merchant.get().getTelefono();
        } else {
            // 3. Si no, averiguar si es Administrador
            Optional<AdministradorAsociacion> admin = adminRepo.findByUsuarioId(usuarioId);
            if (admin.isPresent()) {
                ci = admin.get().getCi();
                exp = admin.get().getExpedido();
                cel = admin.get().getTelefono();
            }
        }

        final String finalCi = ci;
        final String finalExp = exp;
        final String finalCel = cel;
        final String finalNom = nombre;

        return clienteRepo.findByCi(ci).orElseGet(() -> {
            Cliente shadow = new Cliente(finalCi, finalExp, "1234", finalNom, finalCel);
            shadow.setUsuarioId(usuarioId);
            return clienteRepo.save(shadow);
        });
    }
}
