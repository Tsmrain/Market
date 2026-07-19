package com.mutualista.mercado.presentation.controller;

import com.mutualista.mercado.application.GestionarProductoService;
import com.mutualista.mercado.domain.DomainValidationException;
import com.mutualista.mercado.infrastructure.security.TokenProvider;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import com.mutualista.mercado.presentation.dto.EditarProductoRequestDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = ComercianteCatalogoController.class)
public class ComercianteCatalogoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GestionarProductoService gestionarProductoService;

    // Dependencias inyectadas en SimpleHeaderAuthFilter / Auth configuration
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
    public void alEditarProductoConPrecioNegativo_debeRetornarBadRequest() throws Exception {
        EditarProductoRequestDTO dto = new EditarProductoRequestDTO();
        dto.setNombre("Tomate");
        dto.setPrecio(-1.0);

        BDDMockito.given(gestionarProductoService.actualizarProducto(Mockito.anyLong(), Mockito.anyLong(), Mockito.any(EditarProductoRequestDTO.class)))
                .willThrow(new DomainValidationException("El precio del producto no puede ser negativo."));

        mockMvc.perform(put("/api/panel/comerciantes/1/productos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El precio del producto no puede ser negativo."));
    }
}
