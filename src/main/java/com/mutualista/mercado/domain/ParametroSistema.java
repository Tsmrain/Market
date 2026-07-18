package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class ParametroSistema {
    @Id
    private String clave;

    @Column(nullable = false)
    private String valor;

    protected ParametroSistema() {} // Requerido por JPA

    public ParametroSistema(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }

    public String getClave() { return clave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}
