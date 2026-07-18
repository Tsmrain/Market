package com.mutualista.mercado.domain.repository;

import com.mutualista.mercado.domain.Asociacion;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface AsociacionRepository extends CrudRepository<Asociacion, Long> {
    List<Asociacion> findAll();
}
