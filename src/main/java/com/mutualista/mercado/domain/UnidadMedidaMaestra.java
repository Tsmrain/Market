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

    /** GRASP: Information Expert — la propia entidad valida sus reglas de negocio */
    public void actualizarDatos(String nuevoCodigo, String nuevoNombre) {
        if (nuevoCodigo == null || nuevoCodigo.trim().isEmpty()) {
            throw new com.mutualista.mercado.domain.DomainValidationException("El código de la unidad de medida no puede estar vacío.");
        }
        if (nuevoCodigo.contains(" ")) {
            throw new com.mutualista.mercado.domain.DomainValidationException("El código no puede contener espacios en blanco.");
        }
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new com.mutualista.mercado.domain.DomainValidationException("El nombre descriptivo de la unidad de medida no puede estar vacío.");
        }
        this.codigo = nuevoCodigo.trim().toUpperCase();
        this.nombre = nuevoNombre.trim();
    }
}
