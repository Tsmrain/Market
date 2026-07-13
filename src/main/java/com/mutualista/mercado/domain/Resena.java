package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
}
