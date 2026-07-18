package com.mutualista.mercado.presentation.dto;

import java.time.LocalDateTime;

public class ComercianteRecaudacionDTO {
    private Long id;
    private String nombre;
    private String ci;
    private String numeroPuesto;
    private String estadoPago; // "PENDIENTE" o "PAGADO"
    private LocalDateTime fechaPago;
    private Double monto;
    private String telefono;
    private String proximaFechaPago;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }
    public String getNumeroPuesto() { return numeroPuesto; }
    public void setNumeroPuesto(String numeroPuesto) { this.numeroPuesto = numeroPuesto; }
    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getProximaFechaPago() { return proximaFechaPago; }
    public void setProximaFechaPago(String proximaFechaPago) { this.proximaFechaPago = proximaFechaPago; }
}
