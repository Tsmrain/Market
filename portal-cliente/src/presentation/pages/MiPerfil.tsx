import React, { useEffect, useState } from 'react';
import { useAuthController } from '../../application/useAuthController';
import { ComercianteService } from '../../application/ComercianteService';
import type { ComerciantePerfil } from '../../domain/models';

export const MiPerfil: React.FC = () => {
    const { usuario, esComerciante } = useAuthController();

    // Form fields state
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [numeroPuesto, setNumeroPuesto] = useState("");

    // UI state
    const [buscando, setBuscando] = useState(true);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!usuario || !esComerciante) return;
        const cargarPerfil = async () => {
            setBuscando(true);
            setError("");
            try {
                const data = await ComercianteService.obtenerPerfil(usuario.id);
                setNombre(data.nombre || "");
                setTelefono(data.telefono || "");
                setNumeroPuesto(data.numeroPuesto || "");
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar la información del perfil.");
            } finally {
                setBuscando(false);
            }
        };
        cargarPerfil();
    }, [usuario, esComerciante]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) return;

        setMensaje("");
        setError("");

        if (!nombre.trim() || !telefono.trim()) {
            setError("El nombre del comerciante y el teléfono de contacto son obligatorios.");
            return;
        }

        setCargando(true);
        try {
            const perfilActualizado: ComerciantePerfil = {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                numeroPuesto: numeroPuesto.trim() || null
            };

            const response = await ComercianteService.actualizarPerfil(usuario.id, perfilActualizado);
            
            // Mutación local exitosa
            setNombre(response.nombre || "");
            setTelefono(response.telefono || "");
            setNumeroPuesto(response.numeroPuesto || "");

            // Actualizar la sesión en localStorage para que refleje el nuevo nombre al recargar/navegar
            const stored = localStorage.getItem('usuario_sesion');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    parsed.nombre = response.nombre;
                    localStorage.setItem('usuario_sesion', JSON.stringify(parsed));
                    // Despachar evento para sincronizar todas las instancias de useAuthController
                    window.dispatchEvent(new Event('usuario_sesion_changed'));
                } catch (e) {
                    console.error(e);
                }
            }

            setMensaje("Perfil de negocio actualizado correctamente.");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al actualizar los datos del perfil.");
        } finally {
            setCargando(false);
        }
    };

    if (buscando) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Cargando perfil de comerciante...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', textAlign: 'left', padding: '0 16px 40px 16px', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Configuración del Negocio
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Gestiona tus datos de contacto y el número de puesto físico en el Mercado Mutualista.
            </p>

            {mensaje && (
                <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {mensaje}
                </div>
            )}

            {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label htmlFor="perfil-nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Nombre Completo del Comerciante *
                        </label>
                        <input
                            id="perfil-nombre"
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                            maxLength={100}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="perfil-puesto" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Número de Puesto
                        </label>
                        <input
                            id="perfil-puesto"
                            type="text"
                            placeholder="Ej. Puesto #45, Pasillo A"
                            value={numeroPuesto}
                            onChange={e => setNumeroPuesto(e.target.value)}
                            maxLength={50}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="perfil-telefono" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Teléfono de Contacto (WhatsApp) *
                        </label>
                        <input
                            id="perfil-telefono"
                            type="tel"
                            placeholder="Ej. 71234567"
                            value={telefono}
                            onChange={e => setTelefono(e.target.value)}
                            required
                            maxLength={15}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                            Crítico: Este número se utilizará para que los clientes se contacten directamente por WhatsApp.
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            background: 'var(--secondary)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 18px',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: 'var(--shadow-sm)',
                            marginTop: '10px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
                    >
                        {cargando ? "Guardando cambios..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
};
