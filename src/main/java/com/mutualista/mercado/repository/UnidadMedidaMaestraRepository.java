package com.mutualista.mercado.repository;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UnidadMedidaMaestraRepository extends JpaRepository<UnidadMedidaMaestra, Long> {
    Optional<UnidadMedidaMaestra> findByCodigo(String codigo);
}
