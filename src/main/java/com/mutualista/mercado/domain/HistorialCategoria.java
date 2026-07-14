package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class HistorialCategoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_anterior_id")
    private Categoria categoriaAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_nueva_id", nullable = false)
    private Categoria categoriaNueva;

    private LocalDateTime fechaCambio;
    private String ciResponsable; // CI del comerciante o admin que hizo el cambio

    protected HistorialCategoria() {}

    public HistorialCategoria(Producto producto, Categoria anterior, Categoria nueva, String ciResponsable) {
        this.producto = producto;
        this.categoriaAnterior = anterior;
        this.categoriaNueva = nueva;
        this.fechaCambio = LocalDateTime.now();
        this.ciResponsable = ciResponsable;
    }

    public Long getId() { return id; }
    public LocalDateTime getFechaCambio() { return fechaCambio; }
    public Producto getProducto() { return producto; }
    public Categoria getCategoriaAnterior() { return categoriaAnterior; }
    public Categoria getCategoriaNueva() { return categoriaNueva; }
    public String getCiResponsable() { return ciResponsable; }
}
