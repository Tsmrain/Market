package com.mutualista.mercado.presentation.dto;

public class AsociacionDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Long adminId;
    private String adminNombre;
    private String adminCi;

    public AsociacionDTO() {}

    public AsociacionDTO(Long id, String nombre, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
    public String getAdminNombre() { return adminNombre; }
    public void setAdminNombre(String adminNombre) { this.adminNombre = adminNombre; }
    public String getAdminCi() { return adminCi; }
    public void setAdminCi(String adminCi) { this.adminCi = adminCi; }
}
