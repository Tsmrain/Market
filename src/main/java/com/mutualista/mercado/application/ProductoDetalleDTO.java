package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.Resena;
import com.mutualista.mercado.domain.Multimedia;
import java.util.List;
import java.util.stream.Collectors;

public class ProductoDetalleDTO {
    private Long id;
    private String nombre;
    private double precio;
    private String nombreCategoria;
    private int cantidadInteresados;
    private double promedioEstrellas;
    private List<String> comentarios;
    private List<String> galeriaUrls; // Nueva lista de imágenes

    public ProductoDetalleDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.nombreCategoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin Categoría";
        this.cantidadInteresados = producto.getCantidadInteresados();
        this.promedioEstrellas = producto.getResenas().stream().mapToInt(Resena::getCalificacion).average().orElse(0.0);
        this.comentarios = producto.getResenas().stream().map(Resena::getComentario).collect(Collectors.toList());
        
        // Extraer URLs
        this.galeriaUrls = producto.getGaleria().stream().map(Multimedia::getUrl).collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public String getNombreCategoria() { return nombreCategoria; }
    public int getCantidadInteresados() { return cantidadInteresados; }
    public double getPromedioEstrellas() { return promedioEstrellas; }
    public List<String> getComentarios() { return comentarios; }
    public List<String> getGaleriaUrls() { return galeriaUrls; }
}
