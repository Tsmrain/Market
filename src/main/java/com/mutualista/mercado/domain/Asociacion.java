package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class Asociacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    protected Asociacion() {} // Requerido por JPA

    public Asociacion(String nombre) {
        this.nombre = nombre;
    }

    public Asociacion(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public void actualizar(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
}
