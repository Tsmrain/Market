package com.mutualista.mercado.repository;

import com.mutualista.mercado.domain.AdministradorMercado;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

public interface AdministradorMercadoRepository extends CrudRepository<AdministradorMercado, Long> {
    Optional<AdministradorMercado> findByCiAndEliminadoFalse(String ci);
    Optional<AdministradorMercado> findByCi(String ci);
    List<AdministradorMercado> findByEliminadoFalse();
    boolean existsByRol(String rol);
}
