package com.mutualista.mercado.application;
import com.mutualista.mercado.domain.AdministradorMercado;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.repository.AdministradorMercadoRepository;
import com.mutualista.mercado.repository.UnidadMedidaMaestraRepository;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdministradorMercadoRepository adminRepo;
    private final UnidadMedidaMaestraRepository uniRepo;

    @Value("${app.superadmin.nombre}")
    private String superadminNombre;

    @Value("${app.superadmin.ci}")
    private String superadminCi;

    @Value("${app.superadmin.expedido}")
    private String superadminExpedido;

    @Value("${app.superadmin.password}")
    private String superadminPassword;

    public DataSeeder(AdministradorMercadoRepository adminRepo, UnidadMedidaMaestraRepository uniRepo) {
        this.adminRepo = adminRepo;
        this.uniRepo = uniRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seeding Master Data (MDM) if empty
        if (uniRepo.count() == 0) {
            uniRepo.save(new UnidadMedidaMaestra("UNIDAD", "Unidad / Pieza", false));
            uniRepo.save(new UnidadMedidaMaestra("KG", "Kilogramo", true));
            uniRepo.save(new UnidadMedidaMaestra("GRAMO", "Gramos", true));
            uniRepo.save(new UnidadMedidaMaestra("LITRO", "Litro", true));
            uniRepo.save(new UnidadMedidaMaestra("DOCENA", "Docena", false));
            uniRepo.save(new UnidadMedidaMaestra("CAJA", "Caja / Paquete", false));
        }

        // Seeding SuperAdmin (Carga Cero / Arranque en Frío con Resiliencia)
        // Buscamos si existe un SuperAdmin activo o inactivo
        Optional<AdministradorMercado> existingOpt = adminRepo.findByCi(superadminCi);
        
        if (existingOpt.isPresent()) {
            AdministradorMercado existing = existingOpt.get();
            if (existing.isEliminado()) {
                // Reactivación si fue accidentalmente eliminado logicamente (Lockout)
                existing.reactivar();
                existing.actualizarDatos(superadminNombre, superadminPassword, existing.getTelefono());
                adminRepo.save(existing);
                System.out.println("Superadministrador reactivado y credenciales sincronizadas desde propiedades.");
            }
        } else if (!adminRepo.existsByRol("SUPERADMIN")) {
            // Si no existe ningún superadministrador en absoluto, lo creamos
            AdministradorMercado santiago = new AdministradorMercado(superadminCi, superadminExpedido, superadminPassword, superadminNombre, "77777777");
            santiago.setRol("SUPERADMIN");
            adminRepo.save(santiago);
            System.out.println("Superadministrador Santiago inicializado correctamente en base de datos.");
        }
    }
}
