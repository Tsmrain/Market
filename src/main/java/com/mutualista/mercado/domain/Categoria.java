package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;

    // REGLA 1: Baja lógica
    private boolean eliminado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_padre_id")
    private Categoria categoriaPadre;

    @OneToMany(mappedBy = "categoriaPadre", cascade = CascadeType.ALL)
    private List<Categoria> subcategorias = new ArrayList<>();

    protected Categoria() {} // Requerido por JPA

    // Sobrecarga de constructores para flexibilidad (preservada para semilleros y compatibilidad)
    public Categoria(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Categoria(Long id, String nombre, Categoria categoriaPadre) {
        this.id = id;
        this.nombre = nombre;
        this.categoriaPadre = categoriaPadre;
    }

    // Comportamientos de Dominio
    public void actualizarNombre(String nuevoNombre) { this.nombre = nuevoNombre; }
    public void eliminarLogicamente() { this.eliminado = true; }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public Categoria getCategoriaPadre() { return categoriaPadre; }
    public List<Categoria> getSubcategorias() { return subcategorias; }
    public boolean isEliminado() { return eliminado; }
}
