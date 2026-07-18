package com.mutualista.mercado.presentation.dto;

import java.util.List;
import java.util.Map;

public class HistorialFacturasResponse {
    private List<Map<String, Object>> facturas;
    private String proximaFechaPago;

    public HistorialFacturasResponse(List<Map<String, Object>> facturas, String proximaFechaPago) {
        this.facturas = facturas;
        this.proximaFechaPago = proximaFechaPago;
    }

    public List<Map<String, Object>> getFacturas() {
        return facturas;
    }

    public void setFacturas(List<Map<String, Object>> facturas) {
        this.facturas = facturas;
    }

    public String getProximaFechaPago() {
        return proximaFechaPago;
    }

    public void setProximaFechaPago(String proximaFechaPago) {
        this.proximaFechaPago = proximaFechaPago;
    }
}
