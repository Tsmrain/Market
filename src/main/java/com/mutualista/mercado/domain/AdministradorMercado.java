package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class AdministradorMercado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, updatable = false)
    private String ci;
    
    @Column(nullable = false, length = 100)
    private String pin;
    
    private String nombre;
    private String telefono;
    private String expedido;
    private String rol = "ADMIN";
    private boolean eliminado = false;

    protected AdministradorMercado() {}

    public AdministradorMercado(String ci, String expedido, String pin, String nombre, String telefono) {
        this.ci = ci;
        this.expedido = expedido;
        this.pin = pin;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public AdministradorMercado(String ci, String pin, String nombre, String telefono) {
        this(ci, "SC", pin, nombre, telefono);
    }

    public void actualizarDatos(String nombre, String nuevoPin, String telefono) {
        this.nombre = nombre;
        this.telefono = telefono;
        if (nuevoPin != null && !nuevoPin.trim().isEmpty()) { this.pin = nuevoPin; }
    }

    public void eliminarLogicamente() { this.eliminado = true; }
    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public Long getId() { return id; }
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getExpedido() { return expedido; }
    public boolean isEliminado() { return eliminado; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
