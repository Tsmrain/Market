package com.mutualista.mercado.presentation.dto;

import java.util.List;

public class EditarProductoRequestDTO {
    private String nombre;
    private double precio;
    private Long idCategoria;
    private String unidadMedida;
    private String descripcion;
    private String marca;
    private List<String> urlsMultimedia;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public List<String> getUrlsMultimedia() { return urlsMultimedia; }
    public void setUrlsMultimedia(List<String> urlsMultimedia) { this.urlsMultimedia = urlsMultimedia; }
}
