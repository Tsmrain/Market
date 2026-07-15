package com.mutualista.mercado.application;

import com.mutualista.mercado.domain.Comerciante;

public class ComerciantePerfilDTO {
    private String nombre;
    private String nombreNegocio;
    private String telefono;
    private String descripcion;
    private String horarios;

    public ComerciantePerfilDTO() {}

    public ComerciantePerfilDTO(Comerciante comerciante) {
        if (comerciante != null) {
            this.nombre = comerciante.getNombre();
            this.nombreNegocio = comerciante.getNombreNegocio();
            this.telefono = comerciante.getTelefono();
            this.descripcion = comerciante.getDescripcion();
            this.horarios = comerciante.getHorarios();
        }
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNombreNegocio() { return nombreNegocio; }
    public void setNombreNegocio(String nombreNegocio) { this.nombreNegocio = nombreNegocio; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getHorarios() { return horarios; }
    public void setHorarios(String horarios) { this.horarios = horarios; }
}
