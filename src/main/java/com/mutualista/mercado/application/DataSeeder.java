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

        // ── FASE 2: Catálogo Maestro Definitivo del Mercado Mutualista ──────────
        if (categoriaRepo.count() == 0) {

            // 1. Carnes y Proteínas
            Categoria carnes = categoriaRepo.save(new Categoria(null, "Carnes y Proteínas"));
            Categoria res              = categoriaRepo.save(new Categoria(null, "Res",                        carnes));
            Categoria pollo            = categoriaRepo.save(new Categoria(null, "Pollo",                      carnes));
            categoriaRepo.save(new Categoria(null, "Chancho",                    carnes));
            Categoria pescados         = categoriaRepo.save(new Categoria(null, "Pescados y Mariscos",        carnes));
            categoriaRepo.save(new Categoria(null, "Embutidos",                  carnes));

            // 2. Lácteos y Derivados
            Categoria lacteos = categoriaRepo.save(new Categoria(null, "Lácteos y Derivados"));
            Categoria leche            = categoriaRepo.save(new Categoria(null, "Leche",                      lacteos));
            categoriaRepo.save(new Categoria(null, "Quesos",                     lacteos));
            categoriaRepo.save(new Categoria(null, "Yogures",                    lacteos));
            categoriaRepo.save(new Categoria(null, "Mantequilla y Crema",        lacteos));

            // 3. Abarrotes
            Categoria abarrotes = categoriaRepo.save(new Categoria(null, "Abarrotes"));
            categoriaRepo.save(new Categoria(null, "Arroces y Granos",           abarrotes));
            categoriaRepo.save(new Categoria(null, "Aceites y Vinagres",         abarrotes));
            categoriaRepo.save(new Categoria(null, "Enlatados y Conservas",      abarrotes));
            categoriaRepo.save(new Categoria(null, "Salsas y Aderezos",          abarrotes));

            // 4. Frutas y Verduras
            Categoria frutasVerduras = categoriaRepo.save(new Categoria(null, "Frutas y Verduras"));
            categoriaRepo.save(new Categoria(null, "Frutas",                     frutasVerduras));
            categoriaRepo.save(new Categoria(null, "Verduras",                   frutasVerduras));
            categoriaRepo.save(new Categoria(null, "Tubérculos y Raíces",        frutasVerduras));

            // 5. Panadería y Repostería
            Categoria panaderia = categoriaRepo.save(new Categoria(null, "Panadería y Repostería"));
            categoriaRepo.save(new Categoria(null, "Panes",                      panaderia));
            categoriaRepo.save(new Categoria(null, "Pasteles y Masas",           panaderia));
            categoriaRepo.save(new Categoria(null, "Galletas y Bizcochos",       panaderia));

            // 6. Bebidas
            Categoria bebidas = categoriaRepo.save(new Categoria(null, "Bebidas"));
            categoriaRepo.save(new Categoria(null, "Gaseosas",                   bebidas));
            categoriaRepo.save(new Categoria(null, "Jugos y Néctares",           bebidas));
            categoriaRepo.save(new Categoria(null, "Aguas",                      bebidas));
            categoriaRepo.save(new Categoria(null, "Bebidas Energéticas y Deportivas", bebidas));

            // 7. Congelados
            Categoria congelados = categoriaRepo.save(new Categoria(null, "Congelados"));
            categoriaRepo.save(new Categoria(null, "Vegetales Congelados",       congelados));
            categoriaRepo.save(new Categoria(null, "Carnes Congeladas",          congelados));
            categoriaRepo.save(new Categoria(null, "Helados y Postres",          congelados));

            // 8. Cuidado Personal y Belleza
            Categoria belleza = categoriaRepo.save(new Categoria(null, "Cuidado Personal y Belleza"));
            categoriaRepo.save(new Categoria(null, "Cuidado del Cabello",        belleza));
            categoriaRepo.save(new Categoria(null, "Cuidado de la Piel",         belleza));
            categoriaRepo.save(new Categoria(null, "Higiene Bucal",              belleza));
            categoriaRepo.save(new Categoria(null, "Maquillaje y Perfumería",    belleza));

            // 9. Cuidado del Hogar
            Categoria hogar = categoriaRepo.save(new Categoria(null, "Cuidado del Hogar"));
            categoriaRepo.save(new Categoria(null, "Limpieza",                   hogar));
            categoriaRepo.save(new Categoria(null, "Lavandería",                 hogar));
            categoriaRepo.save(new Categoria(null, "Cocina",                     hogar));

            // 10. Ropa, Zapatos y Accesorios
            Categoria ropa = categoriaRepo.save(new Categoria(null, "Ropa, Zapatos y Accesorios"));
            categoriaRepo.save(new Categoria(null, "Ropa",                       ropa));
            categoriaRepo.save(new Categoria(null, "Zapatos",                    ropa));
            categoriaRepo.save(new Categoria(null, "Accesorios",                 ropa));

            // 11. Electrodomésticos y Electrónicos
            Categoria electro = categoriaRepo.save(new Categoria(null, "Electrodomésticos y Electrónicos"));
            categoriaRepo.save(new Categoria(null, "Línea Blanca",               electro));
            categoriaRepo.save(new Categoria(null, "Pequeños Electrodomésticos", electro));
            categoriaRepo.save(new Categoria(null, "Electrónicos",               electro));

            // 12. Comidas y Snacks
            Categoria comidas = categoriaRepo.save(new Categoria(null, "Comidas y Snacks"));
            Categoria comidaTypica      = categoriaRepo.save(new Categoria(null, "Comida Típica",             comidas));
            categoriaRepo.save(new Categoria(null, "Snacks",                     comidas));

            // 13. Otros
            Categoria otros = categoriaRepo.save(new Categoria(null, "Otros"));
            categoriaRepo.save(new Categoria(null, "Flores y Regalos",           otros));
            categoriaRepo.save(new Categoria(null, "Salones de Belleza",         otros));

            System.out.println("✅ Catálogo Maestro definitivo inicializado: 13 categorías raíz, 39 subcategorías.");
        }

        // ── FASE 3: Asociación, Admin y Comerciante con productos semilla ───────
        Asociacion losTajibos = asociacionRepo.findAll().stream()
                .filter(a -> "Asociación Los Tajibos".equals(a.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    Asociacion a = new Asociacion("Asociación Los Tajibos");
                    return asociacionRepo.save(a);
                });

        if (adminRepo.findByCi("2000000").isEmpty()) {
            AdministradorAsociacion mario = new AdministradorAsociacion(
                "2000000", "SC", "Admin2026!", "Don Mario Test", "77777772", losTajibos
            );
            adminRepo.save(mario);
        }

        if (comercianteRepo.findByCi("3000000").isEmpty()) {
            Comerciante carmen = new Comerciante(
                "3000000", "SC", "Comerciante2026!", "Doña Carmen Test", "77777773"
            );
            carmen.setNumeroPuesto("A-12");
            carmen.setAsociacion(losTajibos);
            carmen.setCuentaHabilitada(true);

            // Productos asociados a subcategorías Nivel 2 del catálogo maestro
            Categoria catRes = categoriaRepo.findAll().stream()
                    .filter(c -> "Res".equals(c.getNombre())).findFirst().orElse(null);
            Categoria catPescados = categoriaRepo.findAll().stream()
                    .filter(c -> "Pescados y Mariscos".equals(c.getNombre())).findFirst().orElse(null);
            Categoria catLeche = categoriaRepo.findAll().stream()
                    .filter(c -> "Leche".equals(c.getNombre())).findFirst().orElse(null);
            Categoria catComidaTypica = categoriaRepo.findAll().stream()
                    .filter(c -> "Comida Típica".equals(c.getNombre())).findFirst().orElse(null);
            Categoria catPollo = categoriaRepo.findAll().stream()
                    .filter(c -> "Pollo".equals(c.getNombre())).findFirst().orElse(null);

            if (catRes != null)          carmen.registrarProducto("Carne Molida Premium",    32.50, catRes,         "KG");
            if (catPescados != null)     carmen.registrarProducto("Surubí Fresco",            55.00, catPescados,    "KG");
            if (catLeche != null)        carmen.registrarProducto("Leche Deslactosada 1L",    8.50,  catLeche,       "UNIDAD");
            if (catComidaTypica != null) carmen.registrarProducto("Majadito de Charque",      25.00, catComidaTypica,"UNIDAD");
            if (catPollo != null)        carmen.registrarProducto("Pollo Entero Fresco",      18.00, catPollo,       "KG");

            comercianteRepo.save(carmen);
            System.out.println("✅ Comerciante Doña Carmen y 5 productos semilla (Nivel 2) inicializados.");

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
