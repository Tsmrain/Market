package com.mutualista.mercado.domain.repository;

import com.mutualista.mercado.domain.AdministradorAsociacion;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

public interface AdministradorAsociacionRepository extends CrudRepository<AdministradorAsociacion, Long> {
    Optional<AdministradorAsociacion> findByCiAndEliminadoFalse(String ci);
    Optional<AdministradorAsociacion> findByCi(String ci);
    Optional<AdministradorAsociacion> findByUsuarioId(Long usuarioId);
    List<AdministradorAsociacion> findByEliminadoFalse();
    Optional<AdministradorAsociacion> findByAsociacionIdAndEliminadoFalse(Long asociacionId);
}
