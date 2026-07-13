package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // REGLA 3: Inmutabilidad a nivel de Base de Datos (Protected Variations)
    @Column(unique = true, nullable = false, updatable = false)
    private String ci;
    
    @Column(nullable = false, length = 4)
    private String pin;
    
    private String nombre;
    private String celular;

    protected Cliente() {}

    public Cliente(String ci, String pin, String nombre, String celular) {
        this.ci = ci;
        this.pin = pin;
        this.nombre = nombre;
        this.celular = celular;
    }

    // Constructor de Compatibilidad para Pruebas Unitarias y Semillero Histórico
    public Cliente(Long id, String emailOrNombre) {
        this.id = id;
        this.nombre = emailOrNombre;
        this.ci = "test_" + id; // CI mock único para evitar violaciones de clave única
        this.pin = "1234";
        this.celular = "00000000";
    }

    // Comportamiento de Edición (Information Expert)
    public void actualizarPerfil(String nombre, String celular, String nuevoPin) {
        this.nombre = nombre;
        this.celular = celular;
        if (nuevoPin != null && nuevoPin.length() == 4) {
            this.pin = nuevoPin;
        }
    }

    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public Long getId() { return id; }
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getCelular() { return celular; }
}
