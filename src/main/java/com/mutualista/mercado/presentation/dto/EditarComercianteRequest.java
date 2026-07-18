package com.mutualista.mercado.presentation.dto;

public class EditarComercianteRequest {
    private String ci;
    private String expedido;
    private String nombre;
    private String telefono;
    private String pin;
    private String asociacionId;
    private String numeroPuesto;

    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }
    
    public String getExpedido() { return expedido; }
    public void setExpedido(String expedido) { this.expedido = expedido; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    
    public String getAsociacionId() { return asociacionId; }
    public void setAsociacionId(String asociacionId) { this.asociacionId = asociacionId; }
    
    public String getNumeroPuesto() { return numeroPuesto; }
    public void setNumeroPuesto(String numeroPuesto) { this.numeroPuesto = numeroPuesto; }
}
