package com.mutualista.mercado;

import com.mutualista.mercado.presentation.controller.AdminComercianteController;
import com.mutualista.mercado.presentation.controller.InteraccionClienteController;
import com.mutualista.mercado.presentation.controller.SuperAdminController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class SmokeTest {

    @Autowired
    private AdminComercianteController adminComercianteController;

    @Autowired
    private InteraccionClienteController interaccionClienteController;

    @Autowired
    private SuperAdminController superAdminController;

    @Test
    public void contextLoadsAndControllersAreNotNull() {
        assertThat(adminComercianteController).isNotNull();
        assertThat(interaccionClienteController).isNotNull();
        assertThat(superAdminController).isNotNull();
    }
}
