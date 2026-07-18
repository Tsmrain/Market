package com.mutualista.mercado.domain.repository;
import com.mutualista.mercado.domain.Cliente;


import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

public interface ClienteRepository extends CrudRepository<Cliente, Long> {
    Optional<Cliente> findByCi(String ci);
    Optional<Cliente> findByUsuarioId(Long usuarioId);
}
