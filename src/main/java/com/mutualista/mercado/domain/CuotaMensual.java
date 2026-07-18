package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
public class CuotaMensual {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes;
    private int anio;
    private Double monto = 31.0;

    @Enumerated(EnumType.STRING)
    private EstadoCuota estado = EstadoCuota.PENDIENTE;

    private LocalDateTime fechaPago;
    private String motivoAnulacion;
    private LocalDateTime fechaAnulacion;

    private String metodoPago;
    private String registradoPor;
    private String anuladoPor;

    private LocalDate fechaGeneracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comerciante_id", nullable = false)
    private Comerciante comerciante;

    protected CuotaMensual() {
        this.fechaGeneracion = LocalDate.now();
    } // Requerido por JPA

    public CuotaMensual(Comerciante comerciante, int mes, int anio, Double monto) {
        this.comerciante = comerciante;
        this.mes = mes;
        this.anio = anio;
        this.monto = monto;
        this.estado = EstadoCuota.PENDIENTE;
        this.fechaGeneracion = LocalDate.now();
    }

    public void registrarPago() {
        this.estado = EstadoCuota.PAGADO;
        this.fechaPago = LocalDateTime.now();
        this.motivoAnulacion = null;
        this.fechaAnulacion = null;
    }

    public void anularPago(String motivo) {
        this.estado = EstadoCuota.PENDIENTE;
        this.fechaPago = null;
        this.motivoAnulacion = motivo;
        this.fechaAnulacion = LocalDateTime.now();
    }

    // Getters / Setters
    public Long getId() { return id; }
    public int getMes() { return mes; }
    public int getAnio() { return anio; }
    public Double getMonto() { return monto; }
    public EstadoCuota getEstado() { return estado; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public Comerciante getComerciante() { return comerciante; }
    public String getMotivoAnulacion() { return motivoAnulacion; }
    public LocalDateTime getFechaAnulacion() { return fechaAnulacion; }
    public String getMetodoPago() { return metodoPago; }
    public String getRegistradoPor() { return registradoPor; }
    public String getAnuladoPor() { return anuladoPor; }
    public LocalDate getFechaGeneracion() { return fechaGeneracion; }

    public void setMonto(Double monto) { this.monto = monto; }
    public void setEstado(EstadoCuota estado) { this.estado = estado; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
    public void setMotivoAnulacion(String motivoAnulacion) { this.motivoAnulacion = motivoAnulacion; }
    public void setFechaAnulacion(LocalDateTime fechaAnulacion) { this.fechaAnulacion = fechaAnulacion; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public void setRegistradoPor(String registradoPor) { this.registradoPor = registradoPor; }
    public void setAnuladoPor(String anuladoPor) { this.anuladoPor = anuladoPor; }
    public void setFechaGeneracion(LocalDate fechaGeneracion) { this.fechaGeneracion = fechaGeneracion; }
}
