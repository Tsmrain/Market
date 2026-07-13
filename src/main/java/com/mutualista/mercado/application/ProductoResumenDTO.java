package com.mutualista.mercado.application;
import com.mutualista.mercado.domain.Producto;

public class ProductoResumenDTO {
    private Long id;
    private String nombre;
    private double precio;
    private String nombreCategoria;
    private String imagenPrincipal; // Soluciona el error visual del Catálogo

    public ProductoResumenDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.nombreCategoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin Categoría";
        this.imagenPrincipal = producto.getImagenPrincipal(); // Delegación al Experto
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public String getNombreCategoria() { return nombreCategoria; }
    public String getImagenPrincipal() { return imagenPrincipal; }
}
