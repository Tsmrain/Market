package com.mutualista.mercado.presentation.controller;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.ProductoRepository;


import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/metricas")
@CrossOrigin(origins = "*")
public class MetricasController {

    private final ComercianteRepository comercianteRepo;
    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;

    public MetricasController(ComercianteRepository cRepo, ProductoRepository pRepo, ClienteRepository cliRepo) {
        this.comercianteRepo = cRepo;
        this.productoRepo = pRepo;
        this.clienteRepo = cliRepo;
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerMetricasPrincipales() {
        long totalComerciantes = comercianteRepo.findByEliminadoFalse().size();
        long totalClientes = clienteRepo.count();
        long totalProductosActivos = productoRepo.countByEliminadoFalse();

        // Calculamos Engagement total (Suma de todos los clics a WhatsApp de los comerciantes)
        int totalInteraccionesWhatsApp = comercianteRepo.findByEliminadoFalse().stream()
                .mapToInt(c -> c.getClicsContacto()).sum();

        // Using HashMap explicitly to avoid mixed-type JDK type inference compilation failure
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("comerciantesActivos", totalComerciantes);
        kpis.put("clientesRegistrados", totalClientes);
        kpis.put("productosEnCatalogo", totalProductosActivos);
        kpis.put("interaccionesWhatsApp", totalInteraccionesWhatsApp);

        Map<String, Object> response = new HashMap<>();
        response.put("kpis", kpis);

        return response;
    }

    // NUEVO: Endpoints para Gráficos
    @GetMapping("/graficos/categorias")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> graficoProductosPorCategoria() {
        return productoRepo.countProductosPorCategoria().stream()
            .map(obj -> {
                Map<String, Object> map = new HashMap<>();
                map.put("nombre", obj[0]);
                map.put("cantidad", obj[1]);
                return map;
            })
            .collect(Collectors.toList());
    }

    @GetMapping("/graficos/interacciones")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> graficoTopComerciantes() {
        return comercianteRepo.findTopComerciantesPorInteraccion().stream()
            .map(obj -> {
                Map<String, Object> map = new HashMap<>();
                map.put("nombre", obj[0]);
                map.put("clics", obj[1]);
                return map;
            })
            .collect(Collectors.toList());
    }
}
