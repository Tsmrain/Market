package com.mutualista.mercado.presentation.dto;

public class LoginRequest {
    private String ci;
    private String pin;
    private String expedido;
    
    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    public String getExpedido() { return expedido; }
    public void setExpedido(String expedido) { this.expedido = expedido; }
}
