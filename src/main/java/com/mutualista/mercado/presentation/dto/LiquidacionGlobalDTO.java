package com.mutualista.mercado.presentation.dto;

public class LiquidacionGlobalDTO {
    private Long asociacionId;
    private String asociacionNombre;
    private int comerciantesPagados;
    private int comerciantesPendientes;
    private Double montoRecaudado;

    public LiquidacionGlobalDTO() {}

    public LiquidacionGlobalDTO(Long asociacionId, String asociacionNombre, int comerciantesPagados, int comerciantesPendientes, Double montoRecaudado) {
        this.asociacionId = asociacionId;
        this.asociacionNombre = asociacionNombre;
        this.comerciantesPagados = comerciantesPagados;
        this.comerciantesPendientes = comerciantesPendientes;
        this.montoRecaudado = montoRecaudado;
    }

    public Long getAsociacionId() { return asociacionId; }
    public void setAsociacionId(Long asociacionId) { this.asociacionId = asociacionId; }
    public String getAsociacionNombre() { return asociacionNombre; }
    public void setAsociacionNombre(String asociacionNombre) { this.asociacionNombre = asociacionNombre; }
    public int getComerciantesPagados() { return comerciantesPagados; }
    public void setComerciantesPagados(int comerciantesPagados) { this.comerciantesPagados = comerciantesPagados; }
    public int getComerciantesPendientes() { return comerciantesPendientes; }
    public void setComerciantesPendientes(int comerciantesPendientes) { this.comerciantesPendientes = comerciantesPendientes; }
    public Double getMontoRecaudado() { return montoRecaudado; }
    public void setMontoRecaudado(Double montoRecaudado) { this.montoRecaudado = montoRecaudado; }
}
