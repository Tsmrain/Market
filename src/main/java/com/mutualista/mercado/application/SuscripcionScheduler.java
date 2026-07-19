package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.CuotaMensual;
import com.mutualista.mercado.domain.EstadoCuota;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.CuotaMensualRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class SuscripcionScheduler {

    private final ComercianteRepository comercianteRepo;
    private final CuotaMensualRepository cuotaRepo;
    private final ParametroSistemaService paramService;

    public SuscripcionScheduler(ComercianteRepository comercianteRepo,
                                CuotaMensualRepository cuotaRepo,
                                ParametroSistemaService paramService) {
        this.comercianteRepo = comercianteRepo;
        this.cuotaRepo = cuotaRepo;
        this.paramService = paramService;
    }

    /**
     * Evento A: Generación de Deuda Diaria (Todos los días a las 00:00)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void generarDeudaMensual() {
        LocalDate hoy = LocalDate.now();
        Double tarifa = paramService.obtenerTarifaSuscripcion(); // RESTRICTION 2: Llama una sola vez

        List<Comerciante> activos = comercianteRepo.findByEliminadoFalse();
        for (Comerciante c : activos) {
            // Obtener la última cuota pagada
            Optional<CuotaMensual> ultimaPagadaOpt = c.getCuotas().stream()
                .filter(cu -> cu.getEstado() == EstadoCuota.PAGADO && cu.getFechaPago() != null)
                .max(java.util.Comparator.comparing(CuotaMensual::getAnio)
                    .thenComparing(CuotaMensual::getMes));

            if (ultimaPagadaOpt.isPresent()) {
                CuotaMensual ultimaPagada = ultimaPagadaOpt.get();
                LocalDate nextPayDate = ultimaPagada.getFechaGeneracion().plusMonths(1);

                // Si hoy es igual o mayor a su fecha de próximo pago calculada
                if (!hoy.isBefore(nextPayDate)) {
                    int mesDestino = nextPayDate.getMonthValue();
                    int anioDestino = nextPayDate.getYear();

                    Optional<CuotaMensual> cuotaExistente = cuotaRepo.findByComercianteIdAndMesAndAnio(c.getId(), mesDestino, anioDestino);
                    if (cuotaExistente.isEmpty()) {
                        CuotaMensual nueva = new CuotaMensual(c, mesDestino, anioDestino, tarifa);
                        nueva.setFechaGeneracion(nextPayDate);
                        cuotaRepo.save(nueva);
                    }
                }
            }
        }
        System.out.println("Proceso de generación de deuda diaria (modelo aniversario) completado.");
    }

    /**
     * Evento B: Suspensión Automática por Mora (Todos los días a las 00:00)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void suspenderPorMora() {
        LocalDate hoy = LocalDate.now();
        List<CuotaMensual> pendientes = cuotaRepo.findByEstado(EstadoCuota.PENDIENTE);
        for (CuotaMensual cuota : pendientes) {
            LocalDate fechaGen = cuota.getFechaGeneracion();
            if (fechaGen != null && hoy.isAfter(fechaGen.plusDays(5))) {
                Comerciante c = cuota.getComerciante();
                if (c != null && !c.isEliminado() && c.isCuentaHabilitada()) {
                    c.setCuentaHabilitada(false);
                    comercianteRepo.save(c);
                    System.out.println("Comerciante " + c.getNombre() + " suspendido por mora en cuota " + cuota.getMes() + "/" + cuota.getAnio() + " (generada el " + fechaGen + ").");
                }
            }
        }
        System.out.println("Proceso de suspensión por mora diaria completado.");
    }
}
