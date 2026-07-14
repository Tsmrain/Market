package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class AdministradorMercado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, updatable = false)
    private String ci;
    
    @Column(nullable = false, length = 4)
    private String pin;
    
    private String nombre;
    private boolean eliminado = false;

    protected AdministradorMercado() {}

    public AdministradorMercado(String ci, String pin, String nombre) {
        this.ci = ci;
        this.pin = pin;
        this.nombre = nombre;
    }

    public void actualizarDatos(String nombre, String nuevoPin) {
        this.nombre = nombre;
        if (nuevoPin != null && nuevoPin.length() == 4) { this.pin = nuevoPin; }
    }

    public void eliminarLogicamente() { this.eliminado = true; }
    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public Long getId() { return id; }
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public boolean isEliminado() { return eliminado; }
}
