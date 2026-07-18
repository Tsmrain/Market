package com.mutualista.mercado.domain.repository;

import com.mutualista.mercado.domain.Comerciante;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.Optional;

@DataJpaTest
public class ComercianteRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ComercianteRepository comercianteRepository;

    @Test
    public void alGuardarYBuscarComerciante_debeRetornarCorrectamente() {
        Comerciante comerciante = new Comerciante("1234567", "SC", "1234", "Mario Test", "77777777");
        comerciante.setNumeroPuesto("Puesto 15-B");
        entityManager.persist(comerciante);
        entityManager.flush();

        Optional<Comerciante> encontrado = comercianteRepository.findByCiActivo("1234567");

        assertThat(encontrado).isPresent();
        assertThat(encontrado.get().getNombre()).isEqualTo("Mario Test");
        assertThat(encontrado.get().getNumeroPuesto()).isEqualTo("Puesto 15-B");
    }
}
