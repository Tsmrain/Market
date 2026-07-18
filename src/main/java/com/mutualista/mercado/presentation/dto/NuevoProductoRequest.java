package com.mutualista.mercado.presentation.dto;

public class NuevoProductoRequest {
    private String nombre;
    private double precio;
    private Long idCategoria;
    private String marca;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
}
