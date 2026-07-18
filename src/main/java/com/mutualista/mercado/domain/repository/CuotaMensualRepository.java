package com.mutualista.mercado.domain.repository;

import com.mutualista.mercado.domain.CuotaMensual;
import com.mutualista.mercado.domain.EstadoCuota;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CuotaMensualRepository extends CrudRepository<CuotaMensual, Long> {
    Optional<CuotaMensual> findByComercianteIdAndMesAndAnio(Long comercianteId, int mes, int anio);
    List<CuotaMensual> findByMesAndAnio(int mes, int anio);
    List<CuotaMensual> findByEstadoAndMesAndAnio(EstadoCuota estado, int mes, int anio);
    List<CuotaMensual> findByEstado(EstadoCuota estado);
    
    @Query("SELECT q FROM CuotaMensual q WHERE q.comerciante.id = :comercianteId ORDER BY q.anio DESC, q.mes DESC")
    List<CuotaMensual> findByComercianteIdOrderByAnioDescMesDesc(@Param("comercianteId") Long comercianteId);
}
