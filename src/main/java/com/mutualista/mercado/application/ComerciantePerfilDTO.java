package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Comerciante;

public class ComerciantePerfilDTO {
    private String nombre;
    private String telefono;
    private String numeroPuesto;

    public ComerciantePerfilDTO() {}

    public ComerciantePerfilDTO(Comerciante comerciante) {
        if (comerciante != null) {
            this.nombre = comerciante.getNombre();
            this.telefono = comerciante.getTelefono();
            this.numeroPuesto = comerciante.getNumeroPuesto();
        }
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNumeroPuesto() { return numeroPuesto; }
    public void setNumeroPuesto(String numeroPuesto) { this.numeroPuesto = numeroPuesto; }
}
