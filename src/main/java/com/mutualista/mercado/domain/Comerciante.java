package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

@Entity
public class Comerciante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // REGLA 3: Inmutabilidad del CI
    @Column(unique = true, nullable = false, updatable = false)
    private String ci; 
    
    @Column(nullable = false, length = 4)
    private String pin; 
    
    private String nombre;
    private String telefono;
    private int clicsContacto = 0;
    
    // Estado para Borrado Lógico
    private boolean eliminado = false;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "comerciante_id")
    private List<Producto> catalogo = new ArrayList<>(); 

    protected Comerciante() {} 

    public Comerciante(String ci, String pin, String nombre, String telefono) {
        this.ci = ci;
        this.pin = pin;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    // Constructor de Compatibilidad para Pruebas Unitarias
    public Comerciante(Long id, String nombre, String telefono) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
        this.ci = "test_" + id;
        this.pin = "1234";
    }

    public Producto registrarProducto(String nombre, double precio, Categoria categoria) {
        return registrarProducto(nombre, "", precio, categoria, "UNIDAD");
    }

    public Producto registrarProducto(String nombre, double precio, Categoria categoria, String unidadMedida) {
        return registrarProducto(nombre, "", precio, categoria, unidadMedida);
    }

    public Producto registrarProducto(String nombre, String descripcion, double precio, Categoria categoria, String unidadMedida) {
        Producto nuevoProducto = new Producto(nombre, descripcion, precio, categoria, unidadMedida);
        this.catalogo.add(nuevoProducto);
        return nuevoProducto;
    }

    // REGLA 2: Baja Lógica en Cascada (Information Expert)
    public void eliminarLogicamente() {
        this.eliminado = true;
        for (Producto producto : catalogo) {
            producto.eliminarLogicamente();
        }
    }

    public void actualizarDatos(String nombre, String telefono, String nuevoPin) {
        this.nombre = nombre;
        this.telefono = telefono;
        if (nuevoPin != null && nuevoPin.length() == 4) {
            this.pin = nuevoPin;
        }
    }

    public void registrarClicContacto() { this.clicsContacto++; }
    private String nombreNegocio;
    private String descripcion;
    private String horarios;

    public void actualizarPerfil(String nombre, String nombreNegocio, String telefono, String descripcion, String horarios) {
        this.nombre = nombre;
        this.nombreNegocio = nombreNegocio;
        this.telefono = telefono;
        this.descripcion = descripcion;
        this.horarios = horarios;
    }

    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public List<Producto> getCatalogo() { return Collections.unmodifiableList(catalogo); }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; } // Requerido por el semillero de datos
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getNombreNegocio() { return nombreNegocio; }
    public String getDescripcion() { return descripcion; }
    public String getHorarios() { return horarios; }
    public int getClicsContacto() { return clicsContacto; }
    public boolean isEliminado() { return eliminado; }
}
