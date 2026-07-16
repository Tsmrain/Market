package com.mutualista.mercado.application;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.mutualista.mercado.domain.AdministradorMercado;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.repository.AdministradorMercadoRepository;
import com.mutualista.mercado.repository.UnidadMedidaMaestraRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdministradorMercadoRepository adminRepo;
    private final UnidadMedidaMaestraRepository uniRepo;

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

        // Seeding SuperAdmin Santiago (Carga Cero / Arranque en Frío)
        if (adminRepo.count() == 0) {
            AdministradorMercado santiago = new AdministradorMercado("1000000", "SC", "Mutualista2026!", "Santiago", "77777777");
            santiago.setRol("SUPERADMIN");
            adminRepo.save(santiago);
            System.out.println("Superadministrador Santiago inicializado correctamente en base de datos.");
        }
    }
}
