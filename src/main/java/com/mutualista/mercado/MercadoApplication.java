package com.mutualista.mercado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.mutualista.mercado.domain.*;
import com.mutualista.mercado.repository.*;

@SpringBootApplication
public class MercadoApplication {
    public static void main(String[] args) {
        SpringApplication.run(MercadoApplication.class, args);
    }

}
