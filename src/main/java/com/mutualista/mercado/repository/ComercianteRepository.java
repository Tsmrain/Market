package com.mutualista.mercado.repository;

import com.mutualista.mercado.domain.Comerciante;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
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

    // NUEVO: Agregación para Gráficos (Top 5 Comerciantes con más clics a WhatsApp)
    @Query("SELECT c.nombre, c.clicsContacto FROM Comerciante c WHERE c.eliminado = false ORDER BY c.clicsContacto DESC LIMIT 5")
    List<Object[]> findTopComerciantesPorInteraccion();

    // NUEVO: Buscar comerciante por el ID del producto que posee
    @Query("SELECT c FROM Comerciante c JOIN c.catalogo p WHERE p.id = :idProducto")
    Optional<Comerciante> findByProductoId(@Param("idProducto") Long idProducto);
}
