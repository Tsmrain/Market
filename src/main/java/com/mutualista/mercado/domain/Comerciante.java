package com.mutualista.mercado.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Comerciante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", unique = true, nullable = false)
    private Long usuarioId = java.util.UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;

    // REGLA 3: Inmutabilidad del CI (Desbloqueado para corrección de tipeo por Admin)
    @Column(unique = true, nullable = false)
    private String ci;

    @Column(nullable = false, length = 100)
    private String pin;

    private String nombre;
    private String telefono;
    private int clicsContacto = 0;
    private String expedido;
    private String numeroPuesto;

    // Estado para Borrado Lógico
    private boolean eliminado = false;
    private boolean cuentaHabilitada = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asociacion_id")
    private Asociacion asociacion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "comerciante_id")
    private List<Producto> catalogo = new ArrayList<>();

    @OneToMany(mappedBy = "comerciante", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CuotaMensual> cuotas = new ArrayList<>();

    protected Comerciante() {}

    public Comerciante(String ci, String expedido, String pin, String nombre, String telefono) {
        this.ci = ci;
        this.expedido = expedido;
        this.pin = pin;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public Comerciante(String ci, String pin, String nombre, String telefono) {
        this(ci, "SC", pin, nombre, telefono);
    }

    // Constructor de Compatibilidad para Pruebas Unitarias
    public Comerciante(Long id, String nombre, String telefono) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
        this.ci = "test_" + id;
        this.pin = "1234";
        this.expedido = "SC";
    }

    public Producto registrarProducto(String nombre, double precio, Categoria categoria) {
        return registrarProducto(nombre, "", precio, categoria, "UNIDAD");
    }

    public Producto registrarProducto(String nombre, double precio, Categoria categoria, String unidadMedida) {
        return registrarProducto(nombre, "", precio, categoria, unidadMedida);
    }

    public Producto registrarProducto(String nombre, String descripcion, double precio, Categoria categoria, String unidadMedida) {
        Producto nuevoProducto = new Producto(nombre, descripcion, precio, categoria, unidadMedida);
        this.catalogo.add(nuevoProducto);
        return nuevoProducto;
    }

    // REGLA 2: Baja Lógica en Cascada (Information Expert)
    public void eliminarLogicamente() {
        this.eliminado = true;
        for (Producto producto : catalogo) {
            producto.eliminarLogicamente();
        }
    }

    public void actualizarDatos(String nombre, String telefono, String nuevoPin) {
        this.nombre = nombre;
        this.telefono = telefono;
        if (nuevoPin != null && !nuevoPin.trim().isEmpty()) {
            this.pin = nuevoPin;
        }
    }

    // GRASP: Information Expert
    public void verificarSolvencia() {
        if (this.cuotas != null) {
            for (CuotaMensual cuota : this.cuotas) {
                if (cuota.getEstado() == EstadoCuota.PENDIENTE) {
                    throw new DomainValidationException("El comerciante tiene cuotas vencidas/pendientes y no puede gestionar productos.");
                }
            }
        }
    }

    public void actualizarDatos(String ci, String expedido, String nombre, String telefono, String nuevoPin) {
        this.ci = ci;
        this.expedido = expedido;
        actualizarDatos(nombre, telefono, nuevoPin);
    }

    public void registrarClicContacto() { this.clicsContacto++; }

    public void actualizarPerfil(String nombre, String telefono, String numeroPuesto) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.numeroPuesto = numeroPuesto;
    }

    public boolean validarPin(String pinIngresado) { return this.pin.equals(pinIngresado); }

    public List<Producto> getCatalogo() { return Collections.unmodifiableList(catalogo); }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; } // Requerido por el semillero de datos
    public String getCi() { return ci; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getExpedido() { return expedido; }
    public String getNumeroPuesto() { return numeroPuesto; }
    public void setNumeroPuesto(String numeroPuesto) { this.numeroPuesto = numeroPuesto; }
    public int getClicsContacto() { return clicsContacto; }
    public boolean isEliminado() { return eliminado; }

    public Asociacion getAsociacion() { return asociacion; }
    public void setAsociacion(Asociacion asociacion) { this.asociacion = asociacion; }

    public boolean isCuentaHabilitada() { return cuentaHabilitada; }
    public void setCuentaHabilitada(boolean cuentaHabilitada) { this.cuentaHabilitada = cuentaHabilitada; }

    public List<CuotaMensual> getCuotas() { return cuotas; }
    public void setCuotas(List<CuotaMensual> cuotas) { this.cuotas = cuotas; }

    public String obtenerProximaFechaPago() {
        if (this.cuotas == null || this.cuotas.isEmpty()) {
            return "Sin facturas registradas";
        }

        java.util.Optional<CuotaMensual> ultimaOpt = this.cuotas.stream()
            .max(java.util.Comparator.comparing(CuotaMensual::getAnio)
                .thenComparing(CuotaMensual::getMes));

        if (ultimaOpt.isPresent()) {
            CuotaMensual ultima = ultimaOpt.get();
            if (ultima.getEstado() == EstadoCuota.PAGADO) {
                java.time.LocalDate next = ultima.getFechaGeneracion().plusMonths(1);
                String mesNombre = next.getMonth().getDisplayName(
                    java.time.format.TextStyle.FULL,
                    java.util.Locale.forLanguageTag("es-BO")
                );
                mesNombre = mesNombre.substring(0, 1).toUpperCase() + mesNombre.substring(1).toLowerCase();
                return next.getDayOfMonth() + " de " + mesNombre + " de " + next.getYear();
            } else {
                java.time.LocalDate venc = ultima.getFechaGeneracion();
                String mesNombre = venc.getMonth().getDisplayName(
                    java.time.format.TextStyle.FULL,
                    java.util.Locale.forLanguageTag("es-BO")
                );
                mesNombre = mesNombre.substring(0, 1).toUpperCase() + mesNombre.substring(1).toLowerCase();
                String vencStr = venc.getDayOfMonth() + " de " + mesNombre + " de " + venc.getYear();
                return "Vencida (Expiró el " + vencStr + ")";
            }
        }
        return "Sin facturas registradas";
    }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
