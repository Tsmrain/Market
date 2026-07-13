package com.mutualista.mercado.repository;

import com.mutualista.mercado.domain.Cliente;
import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

public interface ClienteRepository extends CrudRepository<Cliente, Long> {
    Optional<Cliente> findByCi(String ci);
}
