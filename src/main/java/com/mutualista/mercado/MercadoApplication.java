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

    @Bean
    public CommandLineRunner initData(ComercianteRepository cRepo, CategoriaRepository catRepo, ClienteRepository cliRepo) {
        return args -> {
            Categoria carnes = catRepo.save(new Categoria(null, "Carnes"));
            Categoria verduras = catRepo.save(new Categoria(null, "Verduras"));

            // Regla de Negocio 2: Juan Perez ahora tiene CI "1234567", PIN "1234" y teléfono de 8 dígitos
            Comerciante com = new Comerciante("1234567", "1234", "Juan Perez", "71234567");
            com.registrarProducto("Pollo Sofía Entero", 15.50, carnes); 
            com.registrarProducto("Tomate Perita", 2.50, verduras); 
            cRepo.save(com);
            
            cliRepo.save(new Cliente("7777777", "4321", "Santiago", "77777777"));
        };
    }
}
