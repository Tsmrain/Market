import React, { useEffect, useState } from 'react';

export const ConfiguracionSistema: React.FC = () => {
    const [tarifa, setTarifa] = useState("");
    const [cargando, setCargando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeError, setMensajeError] = useState("");

    const cargarParametro = async () => {
        setCargando(true);
        setMensajeError("");
        try {
            const res = await fetch('http://localhost:8080/api/superadmin/parametros/TARIFA_SUSCRIPCION');
            if (res.ok) {
                const data = await res.json();
                setTarifa(data.valor || "");
            } else {
                setMensajeError("No se pudo cargar el parámetro de tarifa.");
            }
        } catch (err) {
            setMensajeError("Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarParametro();
    }, []);

    const guardarParametro = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensajeExito("");
        setMensajeError("");

        const parsed = parseFloat(tarifa);
        if (isNaN(parsed) || parsed <= 0) {
            setMensajeError("Por favor ingrese un valor numérico válido mayor a 0.");
            return;
        }

        setCargando(true);
        try {
            const res = await fetch('http://localhost:8080/api/superadmin/parametros/TARIFA_SUSCRIPCION', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ valor: tarifa })
            });

            if (res.ok) {
                setMensajeExito("Tarifa de suscripción actualizada correctamente.");
            } else {
                const errData = await res.json().catch(() => ({}));
                setMensajeError(errData.error || "No se pudo actualizar la tarifa.");
            }
        } catch (err) {
            setMensajeError("Error al guardar cambios en el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
            <div style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '24px', 
                boxShadow: 'var(--shadow-sm)' 
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0, textTransform: 'uppercase' }}>
                    Configuración del Sistema
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
                    Administre los parámetros operativos de la plataforma.
                </p>
            </div>

            <div style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '32px', 
                boxShadow: 'var(--shadow-sm)',
                maxWidth: '600px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
                    Parámetros de Suscripción
                </h3>

                {mensajeExito && (
                    <div style={{ 
                        background: '#f0fdf4', 
                        border: '1px solid #22c55e',
                        color: '#15803d', 
                        padding: '12px 16px', 
                        borderRadius: '6px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        marginBottom: '20px'
                    }}>
                        {mensajeExito}
                    </div>
                )}

                {mensajeError && (
                    <div style={{ 
                        background: '#fef2f2', 
                        border: '1px solid #ef4444', 
                        color: '#b91c1c', 
                        padding: '12px 16px', 
                        borderRadius: '6px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        marginBottom: '20px'
                    }}>
                        {mensajeError}
                    </div>
                )}

                {cargando && tarifa === "" ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Cargando parámetros...</div>
                ) : (
                    <form onSubmit={guardarParametro} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Tarifa de Suscripción Mensual (Bs)
                            </label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0.1"
                                value={tarifa} 
                                onChange={e => setTarifa(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: '#ffffff',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Costo mensual cobrado por cada comerciante en el mercado.
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargando}
                            style={{
                                background: 'var(--primary)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '12px 20px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s',
                                width: 'fit-content'
                            }}
                            onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                            onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary)'; }}
                        >
                            {cargando ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
