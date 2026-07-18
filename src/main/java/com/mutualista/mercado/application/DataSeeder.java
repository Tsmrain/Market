package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.domain.repository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Optional;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdministradorAsociacionRepository adminRepo;
    private final UnidadMedidaMaestraRepository uniRepo;
    private final AsociacionRepository asociacionRepo;
    private final ComercianteRepository comercianteRepo;
    private final ClienteRepository clienteRepo;
    private final CategoriaRepository categoriaRepo;
    private final CuotaMensualRepository cuotaRepo;
    private final ParametroSistemaRepository paramRepo;

    @Value("${app.superadmin.nombre}")
    private String superadminNombre;

    @Value("${app.superadmin.ci}")
    private String superadminCi;

    @Value("${app.superadmin.expedido}")
    private String superadminExpedido;

    @Value("${app.superadmin.password}")
    private String superadminPassword;

    public DataSeeder(AdministradorAsociacionRepository adminRepo, 
                      UnidadMedidaMaestraRepository uniRepo,
                      AsociacionRepository asociacionRepo,
                      ComercianteRepository comercianteRepo,
                      ClienteRepository clienteRepo,
                      CategoriaRepository categoriaRepo,
                      CuotaMensualRepository cuotaRepo,
                      ParametroSistemaRepository paramRepo) {
        this.adminRepo = adminRepo;
        this.uniRepo = uniRepo;
        this.asociacionRepo = asociacionRepo;
        this.comercianteRepo = comercianteRepo;
        this.clienteRepo = clienteRepo;
        this.categoriaRepo = categoriaRepo;
        this.cuotaRepo = cuotaRepo;
        this.paramRepo = paramRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seeding System Parameters
        if (paramRepo.findById("TARIFA_SUSCRIPCION").isEmpty()) {
            paramRepo.save(new ParametroSistema("TARIFA_SUSCRIPCION", "31.0"));
            System.out.println("Parámetro TARIFA_SUSCRIPCION inicializado a 31.0");
        }

        // Seeding Master Data (MDM) if empty
        if (uniRepo.count() == 0) {
            uniRepo.save(new UnidadMedidaMaestra("UNIDAD", "UNIT_UNIDAD", false));
            uniRepo.save(new UnidadMedidaMaestra("KG", "UNIT_KG", true));
            uniRepo.save(new UnidadMedidaMaestra("GRAMO", "UNIT_GRAMO", true));
            uniRepo.save(new UnidadMedidaMaestra("LITRO", "UNIT_LITRO", true));
            uniRepo.save(new UnidadMedidaMaestra("DOCENA", "UNIT_DOCENA", false));
            uniRepo.save(new UnidadMedidaMaestra("CAJA", "UNIT_CAJA", false));
        }

        // Seeding SuperAdmin (Carga Cero / Arranque en Frío con Resiliencia)
        Optional<AdministradorAsociacion> existingOpt = adminRepo.findByCi(superadminCi);
        
        if (existingOpt.isPresent()) {
            AdministradorAsociacion existing = existingOpt.get();
            if (existing.isEliminado()) {
                existing.reactivar();
                existing.actualizarDatos(superadminNombre, superadminPassword, existing.getTelefono());
                adminRepo.save(existing);
                System.out.println("Superadministrador reactivado y credenciales sincronizadas desde propiedades.");
            }
        } else {
            AdministradorAsociacion santiago = new AdministradorAsociacion(
                superadminCi, 
                superadminExpedido, 
                superadminPassword, 
                superadminNombre, 
                "77777777"
            );
            santiago.setRol("SUPERADMIN");
            adminRepo.save(santiago);
            System.out.println("Superadministrador Santiago inicializado correctamente en la base de datos.");
        }

        // Seeding Categories
        if (categoriaRepo.count() == 0) {
            categoriaRepo.save(new Categoria(null, "CAT_LACTEOS"));
            categoriaRepo.save(new Categoria(null, "CAT_ABARROTES"));
            System.out.println("Categorías de prueba inicializadas.");
        }

        // Seeding Association
        Asociacion losTajibos = asociacionRepo.findAll().stream()
                .filter(a -> "Asociación Los Tajibos".equals(a.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    Asociacion a = new Asociacion("Asociación Los Tajibos");
                    return asociacionRepo.save(a);
                });

        // Seeding AdministradorAsociacion
        if (adminRepo.findByCi("2000000").isEmpty()) {
            AdministradorAsociacion mario = new AdministradorAsociacion(
                "2000000",
                "SC",
                "Admin2026!",
                "Don Mario Test",
                "77777772",
                losTajibos
            );
            adminRepo.save(mario);
        }

        // Se seeding Comerciante y sus productos (Patrón Creator)
        if (comercianteRepo.findByCi("3000000").isEmpty()) {
            Comerciante carmen = new Comerciante(
                "3000000",
                "SC",
                "Comerciante2026!",
                "Doña Carmen Test",
                "77777773"
            );
            carmen.setNumeroPuesto("A-12");
            carmen.setAsociacion(losTajibos);
            carmen.setCuentaHabilitada(true);

            // Obtener categorías de prueba
            Categoria lacteos = categoriaRepo.findAll().stream()
                    .filter(cat -> "CAT_LACTEOS".equals(cat.getNombre()))
                    .findFirst()
                    .orElse(null);

            Categoria abarrotes = categoriaRepo.findAll().stream()
                    .filter(cat -> "CAT_ABARROTES".equals(cat.getNombre()))
                    .findFirst()
                    .orElse(null);

            if (lacteos != null) {
                carmen.registrarProducto("Leche Pil Entera", 6.50, lacteos, "UNIT_LITRO");
                carmen.registrarProducto("Queso Menonita", 25.00, lacteos, "UNIT_KG");
            }
            if (abarrotes != null) {
                carmen.registrarProducto("Arroz Famoso 1kg", 8.00, abarrotes, "UNIT_KG");
            }

            comercianteRepo.save(carmen);
            System.out.println("Comerciante de prueba Carmen y sus 3 productos inicializados.");

            // Cargar cuota inicial pagada para Doña Carmen Test
            LocalDate hoy = LocalDate.now();
            CuotaMensual cuotaCarmen = new CuotaMensual(carmen, hoy.getMonthValue(), hoy.getYear(), 31.0);
            cuotaCarmen.registrarPago();
            cuotaCarmen.setMetodoPago("Efectivo");
            cuotaCarmen.setRegistradoPor("Don Mario Test");
            cuotaCarmen.setFechaGeneracion(hoy);
            cuotaRepo.save(cuotaCarmen);
            System.out.println("Cuota inicial pagada de aniversario registrada para Carmen.");
        }

        // Seeding Cliente
        if (clienteRepo.findByCi("4000000").isEmpty()) {
            Cliente juan = new Cliente(
                "4000000",
                "SC",
                "Cliente2026!",
                "Juan Cliente",
                "77777774"
            );
            clienteRepo.save(juan);
        }

        // Imprimir credenciales de prueba en consola
        System.out.println("=========================================================================");
        System.out.println("                     CREDENCIALES DE PRUEBA GENERALES                     ");
        System.out.println("=========================================================================");
        System.out.println("| ROL              | CI       | CONTRASEÑA        | NOMBRE              |");
        System.out.println("-------------------------------------------------------------------------");
        System.out.println("| SUPERADMIN       | " + superadminCi + "  | " + superadminPassword + "    | " + superadminNombre + "            |");
        System.out.println("| ADMIN_ASOCIACION | 2000000  | Admin2026!        | Don Mario Test      |");
        System.out.println("| COMERCIANTE      | 3000000  | Comerciante2026!  | Doña Carmen Test    |");
        System.out.println("| CLIENTE          | 4000000  | Cliente2026!      | Juan Cliente        |");
        System.out.println("=========================================================================");
    }
}
