package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int calificacion;
    private String comentario;
    private LocalDateTime fecha;

    @ManyToOne
    private Cliente cliente;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "resena_id")
    private List<Multimedia> evidencias = new ArrayList<>();

    protected Resena() {}

    // Constructor accesible solo en este paquete (por el Producto)
    protected Resena(Cliente cliente, int calificacion, String comentario) {
        this.cliente = cliente;
        this.calificacion = calificacion;
        this.comentario = comentario;
        this.fecha = LocalDateTime.now();
    }

    public int getCalificacion() { return calificacion; }
    public String getComentario() { return comentario; }
    public Cliente getCliente() { return cliente; }
    public LocalDateTime getFecha() { return fecha; }
    
    public List<Multimedia> getEvidencias() { return evidencias; }
    
    public void agregarEvidencia(String url, String tipoArchivo) {
        this.evidencias.add(new Multimedia(url, tipoArchivo));
    }
}
