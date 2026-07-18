package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.application.ClienteService;
import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.repository.ProductoRepository;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.infrastructure.security.TokenProvider;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.MessageSource;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;

// Importaciones estaticas requeridas explicitamente por el arquitecto
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = InteraccionClienteController.class)
public class InteraccionClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoRepository productoRepository;

    @MockitoBean
    private ClienteService clienteService;

    @MockitoBean
    private MessageSource messageSource;

    // Dependencias inyectadas en SimpleHeaderAuthFilter
    @MockitoBean
    private TokenProvider tokenProvider;

    @MockitoBean
    private ClienteRepository clienteRepository;

    @MockitoBean
    private ComercianteRepository comercianteRepository;

    @MockitoBean
    private AdministradorAsociacionRepository administradorAsociacionRepository;

    @Test
    @WithMockUser
    public void alEnviarResenaConUsuarioAutenticado_debeRetornarExito() throws Exception {
        // Configurar mocks para evitar NullPointerException / RuntimeException
        Producto mockProducto = Mockito.mock(Producto.class);
        BDDMockito.given(productoRepository.findById(1L)).willReturn(Optional.of(mockProducto));

        Cliente mockCliente = Mockito.mock(Cliente.class);
        BDDMockito.given(clienteService.obtenerOCrearClienteSombra(Mockito.anyLong(), Mockito.anyString()))
                .willReturn(mockCliente);

        mockMvc.perform(post("/api/productos/1/resenas")
                .with(csrf())
                .contentType("application/json")
                .content("{\"idCliente\":1,\"calificacion\":5,\"comentario\":\"Excelente\"}"))
                .andExpect(status().isOk());
    }
}
