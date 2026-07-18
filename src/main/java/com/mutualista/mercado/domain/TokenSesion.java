package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TokenSesion {
    @Id
    private String token;

    private Long userId;
    private String rol;
    private LocalDateTime fechaExpiracion;

    protected TokenSesion() {} // Requerido por JPA

    public TokenSesion(String token, Long userId, String rol, LocalDateTime fechaExpiracion) {
        this.token = token;
        this.userId = userId;
        this.rol = rol;
        this.fechaExpiracion = fechaExpiracion;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getRol() { return rol; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
}
