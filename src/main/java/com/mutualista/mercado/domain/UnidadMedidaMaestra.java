package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class UnidadMedidaMaestra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    private boolean admiteDecimales;

    protected UnidadMedidaMaestra() {}

    public UnidadMedidaMaestra(String codigo, String nombre, boolean admiteDecimales) {
        this.codigo = codigo != null ? codigo.trim().toUpperCase() : "";
        this.nombre = nombre;
        this.admiteDecimales = admiteDecimales;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public boolean isAdmiteDecimales() { return admiteDecimales; }

    public void actualizar(String nombre, boolean admiteDecimales) {
        this.nombre = nombre;
        this.admiteDecimales = admiteDecimales;
    }
}
