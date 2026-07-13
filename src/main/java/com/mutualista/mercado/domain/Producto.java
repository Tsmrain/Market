package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

@Entity
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private double precio;

    private boolean estaDisponible = true; 
    private boolean eliminado = false; 

    @ManyToOne
    @JoinColumn(name = "categoria_id", updatable = false) // REGLA 2: La categoría es inmutable
    private Categoria categoria;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "producto_id")
    private List<Resena> resenas = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "producto_interes", joinColumns = @JoinColumn(name = "producto_id"), inverseJoinColumns = @JoinColumn(name = "cliente_id"))
    private Set<Cliente> interesados = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "producto_id")
    private List<Multimedia> galeria = new ArrayList<>();

    protected Producto() {} 

    public Producto(String nombre, double precio, Categoria categoria) {
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
    }

    // Comportamientos
    public void alternarDisponibilidad() { this.estaDisponible = !this.estaDisponible; }
    public void eliminarLogicamente() { this.eliminado = true; }
    
    // REGLA 2: Actualización de datos seguros
    public void actualizarDatos(String nombre, double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
    
    public void limpiarGaleria() { this.galeria.clear(); }
    
    public void agregarMultimedia(String url, String tipoArchivo) {
        this.galeria.add(new Multimedia(url, tipoArchivo));
    }
    
    public Resena agregarResena(Cliente cliente, int calificacion, String comentario) {
        Resena nuevaResena = new Resena(cliente, calificacion, comentario);
        this.resenas.add(nuevaResena);
        return nuevaResena;
    }
    
    public void agregarInteresado(Cliente cliente) { this.interesados.add(cliente); }
    
    // REGLA 1: La primera foto es la portada (Information Expert)
    public String getImagenPrincipal() {
        if (galeria != null && !galeria.isEmpty()) {
            return galeria.get(0).getUrl();
        }
        return null;
    }

    public int getCantidadInteresados() { return this.interesados.size(); }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public Categoria getCategoria() { return categoria; }
    public boolean isEstaDisponible() { return estaDisponible; }
    public boolean isEliminado() { return eliminado; }
    public List<Resena> getResenas() { return Collections.unmodifiableList(resenas); }
    public List<Multimedia> getGaleria() { return Collections.unmodifiableList(galeria); }
}
