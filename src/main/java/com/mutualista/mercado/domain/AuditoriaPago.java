package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditoriaPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuota_id", nullable = false)
    private CuotaMensual cuota;

    @Column(nullable = false)
    private String accion; // "REGISTRO" o "ANULACION"

    @Column(nullable = false)
    private String actor; // Nombre del administrador

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(length = 1000)
    private String detalle; // Metodo de pago o Motivo de anulacion

    protected AuditoriaPago() {} // Requerido por JPA

    public AuditoriaPago(CuotaMensual cuota, String accion, String actor, String detalle) {
        this.cuota = cuota;
        this.accion = accion;
        this.actor = actor;
        this.fechaHora = LocalDateTime.now();
        this.detalle = detalle;
    }

    public Long getId() { return id; }
    public CuotaMensual getCuota() { return cuota; }
    public String getAccion() { return accion; }
    public String getActor() { return actor; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getDetalle() { return detalle; }
}
