package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", unique = true, nullable = false)
    private Long usuarioId = java.util.UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;
    
    // REGLA 3: Inmutabilidad a nivel de Base de Datos (Protected Variations)
    @Column(unique = true, nullable = false, updatable = false)
    private String ci;
    
    @Column(nullable = false, length = 100)
    private String pin;
    
    private String nombre;
    private String celular;
    private String expedido;

    protected Cliente() {}

    public Cliente(String ci, String expedido, String pin, String nombre, String celular) {
        this.ci = ci;
        this.expedido = expedido;
        this.pin = pin;
        this.nombre = nombre;
        this.celular = celular;
    }

    public Cliente(String ci, String pin, String nombre, String celular) {
        this(ci, "SC", pin, nombre, celular);
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
        if (nuevoPin != null && !nuevoPin.trim().isEmpty()) {
            this.pin = nuevoPin;
        }
    }

    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public Long getId() { return id; }
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getCelular() { return celular; }
    public String getExpedido() { return expedido; }
    
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
