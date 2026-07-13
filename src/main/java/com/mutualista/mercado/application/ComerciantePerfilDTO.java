package com.mutualista.mercado.application;
import com.mutualista.mercado.domain.Comerciante;

public class ComerciantePerfilDTO {
    private Long id;
    private String nombre;
    private int cantidadProductos;
    // Omitimos intencionadamente el teléfono aquí y los clics para proteger las métricas internas

    public ComerciantePerfilDTO(Comerciante comerciante) {
        this.id = comerciante.getId();
        this.nombre = comerciante.getNombre();
        this.cantidadProductos = comerciante.getCatalogo().size();
    }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public int getCantidadProductos() { return cantidadProductos; }
}
