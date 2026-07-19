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
    private String marca = "";

    private boolean estaDisponible = true; 
    private boolean eliminado = false; 

    @Enumerated(EnumType.STRING)
    private EstadoProducto estado = EstadoProducto.ACTIVO;

    @ManyToOne
    @JoinColumn(name = "categoria_id") // Quitada inmutabilidad física en la relación
    private Categoria categoria;

    @Column(nullable = false)
    private String unidadMedida = "UNIDAD";

    @Column(nullable = false, length = 1000)
    private String descripcion = "";

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
        this(nombre, "", precio, categoria, "UNIDAD");
    }

    public Producto(String nombre, double precio, Categoria categoria, String unidadMedida) {
        this(nombre, "", precio, categoria, unidadMedida);
    }

    public Producto(String nombre, String descripcion, double precio, Categoria categoria, String unidadMedida) {
        this.nombre = nombre;
        this.descripcion = descripcion != null ? descripcion : "";
        this.precio = precio;
        this.categoria = categoria;
        this.unidadMedida = unidadMedida != null ? unidadMedida : "UNIDAD";
    }

    // Comportamientos
    public void alternarDisponibilidad() { this.estaDisponible = !this.estaDisponible; }
    public void eliminarLogicamente() { this.eliminado = true; }
    
    // REGLA 2: Actualización de datos seguros
    public void actualizarDatos(String nombre, double precio) {
        actualizarDatos(nombre, precio, this.unidadMedida, this.descripcion);
    }

    public void actualizarDatos(String nombre, double precio, String unidadMedida) {
        actualizarDatos(nombre, precio, unidadMedida, this.descripcion);
    }

    public void actualizarDatos(String nombre, double precio, String unidadMedida, String descripcion) {
        actualizarDatos(nombre, precio, unidadMedida, descripcion, this.marca);
    }

    public void actualizarDatos(String nombre, double precio, String unidadMedida, String descripcion, String marca) {
        this.nombre = nombre;
        this.precio = precio;
        this.unidadMedida = unidadMedida != null ? unidadMedida : "UNIDAD";
        this.descripcion = descripcion != null ? descripcion : "";
        this.marca = marca != null ? marca : "";
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
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca != null ? marca : ""; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public Categoria getCategoria() { return categoria; }
    public boolean isEstaDisponible() { return estaDisponible; }
    public boolean isEliminado() { return eliminado; }
    public List<Resena> getResenas() { return Collections.unmodifiableList(resenas); }
    public List<Multimedia> getGaleria() { return Collections.unmodifiableList(galeria); }

    public EstadoProducto getEstado() { return estado; }
    public void setEstado(EstadoProducto estado) { this.estado = estado; }

    public void archivar() {
        this.estado = EstadoProducto.ARCHIVADO;
        this.estaDisponible = false;
        this.eliminado = true;
    }

    public void cambiarCategoria(Categoria nuevaCategoria) {
        this.categoria = nuevaCategoria;
    }

    public void eliminarMultimedia(Long idMultimedia) {
        this.galeria.removeIf(m -> m.getId().equals(idMultimedia));
    }

    public String getUnidadMedida() { return unidadMedida; }
    public String getDescripcion() { return descripcion; }
}
