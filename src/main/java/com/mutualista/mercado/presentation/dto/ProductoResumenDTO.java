package com.mutualista.mercado.presentation.dto;
import com.mutualista.mercado.domain.Producto;


public class ProductoResumenDTO {
    private Long id;
    private String nombre;
    private double precio;
    private String nombreCategoria;
    private String imagenPrincipal;
    private boolean estaDisponible; 
    private String unidadMedida;
    private String descripcion;

    public ProductoResumenDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.nombreCategoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin Categoría";
        this.imagenPrincipal = producto.getImagenPrincipal();
        this.estaDisponible = producto.isEstaDisponible();
        this.unidadMedida = producto.getUnidadMedida();
        this.descripcion = producto.getDescripcion() != null ? producto.getDescripcion() : "";
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public String getNombreCategoria() { return nombreCategoria; }
    public String getImagenPrincipal() { return imagenPrincipal; }
    public boolean isEstaDisponible() { return estaDisponible; }
    public String getUnidadMedida() { return unidadMedida; }
    public String getDescripcion() { return descripcion; }
}
