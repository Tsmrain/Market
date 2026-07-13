package com.mutualista.mercado.domain;

import jakarta.persistence.*;

@Entity
public class Multimedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String url;
    private String tipoArchivo; // ej. "imagen", "video"

    protected Multimedia() {}

    protected Multimedia(String url, String tipoArchivo) {
        this.url = url;
        this.tipoArchivo = tipoArchivo;
    }

    public Long getId() { return id; }
    public String getUrl() { return url; }
    public String getTipoArchivo() { return tipoArchivo; }
}
