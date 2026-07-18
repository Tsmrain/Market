package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class AdministradorAsociacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, updatable = false)
    private String ci;
    
    @Column(nullable = false, length = 100)
    private String password;
    
    private String nombre;
    private String telefono;
    private String expedido;
    private String rol = "ADMIN_ASOCIACION";
    private boolean eliminado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asociacion_id", nullable = true)
    private Asociacion asociacion;

    protected AdministradorAsociacion() {} // Requerido por JPA

    public AdministradorAsociacion(String ci, String expedido, String password, String nombre, String telefono, Asociacion asociacion) {
        this.ci = ci;
        this.expedido = expedido;
        this.password = password;
        this.nombre = nombre;
        this.telefono = telefono;
        this.asociacion = asociacion;
    }

    public AdministradorAsociacion(String ci, String expedido, String password, String nombre, String telefono) {
        this(ci, expedido, password, nombre, telefono, null);
    }

    public void actualizarDatos(String nombre, String nuevoPassword, String telefono) {
        this.nombre = nombre;
        this.telefono = telefono;
        if (nuevoPassword != null && !nuevoPassword.trim().isEmpty()) { 
            this.password = nuevoPassword; 
        }
    }

    public void eliminarLogicamente() { this.eliminado = true; }
    public void reactivar() { this.eliminado = false; }
    public boolean validarPassword(String passwordIngresado) { return this.password.equals(passwordIngresado); }

    public Long getId() { return id; }
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getExpedido() { return expedido; }
    public boolean isEliminado() { return eliminado; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    
    public Asociacion getAsociacion() { return asociacion; }
    public void setAsociacion(Asociacion asociacion) { this.asociacion = asociacion; }
}
