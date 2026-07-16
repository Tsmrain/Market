package com.mutualista.mercado.presentation.dto;
import com.mutualista.mercado.domain.Categoria;


public class CategoriaDTO {
    private Long id;
    private String nombre;
    private Long idCategoriaPadre;

    public CategoriaDTO(Categoria categoria) {
        this.id = categoria.getId();
        this.nombre = categoria.getNombre();
        this.idCategoriaPadre = categoria.getCategoriaPadre() != null ? categoria.getCategoriaPadre().getId() : null;
    }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public Long getIdCategoriaPadre() { return idCategoriaPadre; }
}
