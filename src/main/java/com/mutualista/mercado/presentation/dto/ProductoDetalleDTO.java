package com.mutualista.mercado.presentation.dto;

import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.Multimedia;
import com.mutualista.mercado.domain.Producto;
import com.mutualista.mercado.domain.Resena;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

public class ProductoDetalleDTO {
    private Long id;
    private String nombre;
    private double precio;
    private String nombreCategoria;
    private int cantidadInteresados;
    private double promedioEstrellas;
    private List<String> comentarios;
    private List<String> galeriaUrls; 
    private List<Map<String, Object>> galeria;

    // NUEVA LISTA DETALLADA DE RESEÑAS (Model-View Separation)
    private List<ResenaInfoDTO> resenas;

    // NUEVOS CAMPOS: Comerciante propietario
    private Long idComerciante;
    private String nombreComerciante;
    private String telefonoComerciante;
    private String numeroPuesto;

    private boolean estaDisponible;
    private String unidadMedida;
    private String descripcion;

    public static class ResenaInfoDTO {
        private String nombreCliente;
        private int calificacion;
        private String comentario;

        public ResenaInfoDTO(Resena r) {
            this.nombreCliente = r.getCliente() != null ? r.getCliente().getNombre() : "Cliente Anónimo";
            this.calificacion = r.getCalificacion();
            this.comentario = r.getComentario();
        }

        public String getNombreCliente() { return nombreCliente; }
        public int getCalificacion() { return calificacion; }
        public String getComentario() { return comentario; }
    }

    public ProductoDetalleDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.nombreCategoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin Categoría";
        this.estaDisponible = producto.isEstaDisponible();
        this.unidadMedida = producto.getUnidadMedida();
        this.descripcion = producto.getDescripcion() != null ? producto.getDescripcion() : "";
        this.cantidadInteresados = producto.getCantidadInteresados();
        this.promedioEstrellas = producto.getResenas().stream().mapToInt(Resena::getCalificacion).average().orElse(0.0);
        this.comentarios = producto.getResenas().stream().map(Resena::getComentario).collect(Collectors.toList());
        this.galeriaUrls = producto.getGaleria().stream().map(Multimedia::getUrl).collect(Collectors.toList());
        
        // Mapear reseñas detalladas
        this.resenas = producto.getResenas().stream().map(ResenaInfoDTO::new).collect(Collectors.toList());

        this.galeria = producto.getGaleria().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("url", m.getUrl());
            map.put("tipo", m.getTipoArchivo());
            return map;
        }).collect(Collectors.toList());
    }

    public ProductoDetalleDTO(Producto producto, Comerciante comerciante) {
        this(producto);
        if (comerciante != null) {
            this.idComerciante = comerciante.getId();
            this.nombreComerciante = comerciante.getNombre();
            this.telefonoComerciante = comerciante.getTelefono();
            this.numeroPuesto = comerciante.getNumeroPuesto();
        }
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public String getNombreCategoria() { return nombreCategoria; }
    public int getCantidadInteresados() { return cantidadInteresados; }
    public double getPromedioEstrellas() { return promedioEstrellas; }
    public List<String> getComentarios() { return comentarios; }
    public List<String> getGaleriaUrls() { return galeriaUrls; }
    public List<Map<String, Object>> getGaleria() { return galeria; }
    public List<ResenaInfoDTO> getResenas() { return resenas; }

    public Long getIdComerciante() { return idComerciante; }
    public String getNombreComerciante() { return nombreComerciante; }
    public String getTelefonoComerciante() { return telefonoComerciante; }
    public String getNumeroPuesto() { return numeroPuesto; }
    public boolean isEstaDisponible() { return estaDisponible; }
    public String getUnidadMedida() { return unidadMedida; }
    public String getDescripcion() { return descripcion; }
}
