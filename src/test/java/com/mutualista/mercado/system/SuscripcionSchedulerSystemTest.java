package com.mutualista.mercado.system;

import com.mutualista.mercado.application.SuscripcionScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SuscripcionSchedulerSystemTest {

    @Autowired
    private SuscripcionScheduler scheduler;

    @Test
    public void contextLoadsAndSchedulerIsPresent() {
        assertThat(scheduler).isNotNull();
    }
}
