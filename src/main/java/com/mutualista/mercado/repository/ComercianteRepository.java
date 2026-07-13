package com.mutualista.mercado.repository;

import com.mutualista.mercado.domain.Comerciante;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

public interface ComercianteRepository extends CrudRepository<Comerciante, Long> {
    // Validar login solo si no está eliminado
    @Query("SELECT c FROM Comerciante c WHERE c.ci = :ci AND c.eliminado = false")
    Optional<Comerciante> findByCiActivo(String ci);
    
    // Buscar para control de duplicados (Ignora si está eliminado)
    Optional<Comerciante> findByCi(String ci);

    // Listado para el Administrador
    List<Comerciante> findByEliminadoFalse();
}
