package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.ParametroSistema;
import com.mutualista.mercado.domain.repository.ParametroSistemaRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ParametroSistemaService {
    private final ParametroSistemaRepository paramRepo;

    public ParametroSistemaService(ParametroSistemaRepository paramRepo) {
        this.paramRepo = paramRepo;
    }

    public Double obtenerTarifaSuscripcion() {
        Optional<ParametroSistema> param = paramRepo.findById("TARIFA_SUSCRIPCION");
        if (param.isPresent()) {
            try {
                return Double.parseDouble(param.get().getValor());
            } catch (NumberFormatException e) {
                return 31.0;
            }
        }
        return 31.0;
    }
}
