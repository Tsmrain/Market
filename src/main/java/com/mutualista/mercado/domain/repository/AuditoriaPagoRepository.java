package com.mutualista.mercado.domain.repository;

import com.mutualista.mercado.domain.AuditoriaPago;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface AuditoriaPagoRepository extends CrudRepository<AuditoriaPago, Long> {
    List<AuditoriaPago> findByCuotaIdOrderByFechaHoraDesc(Long cuotaId);
}
