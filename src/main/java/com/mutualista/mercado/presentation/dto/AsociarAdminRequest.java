package com.mutualista.mercado.presentation.dto;

public class AsociarAdminRequest {
    private String ci;
    private String expedido;
    private String pin;
    private String nombre;
    private String telefono;

    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }
    public String getExpedido() { return expedido; }
    public void setExpedido(String expedido) { this.expedido = expedido; }
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}
