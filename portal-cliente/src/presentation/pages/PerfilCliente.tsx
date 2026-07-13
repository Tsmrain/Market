import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { CatalogoService } from '../../application/CatalogoService';

export const PerfilCliente: React.FC = () => {
    const { usuario, esCliente } = useAuthController();
    const navigate = useNavigate();

    const [ci, setCi] = useState("");
    const [nombre, setNombre] = useState("");
    const [celular, setCelular] = useState("");
    const [pin, setPin] = useState("");
    const [cargando, setCargando] = useState(false);
    const [buscando, setBuscando] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    // Guardia de rol
    useEffect(() => {
        if (!usuario || !esCliente) {
            navigate('/login/cliente');
        }
    }, [usuario, esCliente, navigate]);

    // Cargar perfil
    useEffect(() => {
        if (!usuario || !esCliente) return;
        const cargar = async () => {
            setBuscando(true);
            try {
                const data = await CatalogoService.obtenerPerfilCliente(usuario.id);
                setCi(data.ci);
                setNombre(data.nombre);
                setCelular(data.celular);
            } catch (err: any) {
                console.error(err);
                setError("No se pudo cargar la información del perfil.");
            } finally {
                setBuscando(false);
            }
        };
        cargar();
    }, [usuario, esCliente]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!nombre.trim() || !celular.trim()) {
            setError("Nombre y Celular son requeridos.");
            return;
        }

        // Validación de celular boliviano (8 dígitos y empieza con 6 o 7)
        if (!/^[67]\d{7}$/.test(celular)) {
            setError("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
            return;
        }

        if (pin.trim() && pin.length !== 4) {
            setError("El PIN nuevo debe tener exactamente 4 dígitos.");
            return;
        }

        setCargando(true);
        try {
            await CatalogoService.actualizarPerfilCliente(
                usuario!.id,
                nombre,
                celular,
                pin.trim() ? pin : undefined
            );
            setMensaje("¡Perfil actualizado con éxito!");
            setPin("");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al actualizar el perfil.");
        } finally {
            setCargando(false);
        }
    };

    if (!usuario || !esCliente) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Mi Perfil de Cliente</span>
                </div>
                <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>
                    ← Volver al Catálogo
                </Link>
            </header>

            {/* Layout Form */}
            <main style={{
                flexGrow: 1,
                padding: '40px 24px',
                maxWidth: '500px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '32px',
                    boxShadow: 'var(--shadow-md)',
                    textAlign: 'left'
                }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                        Editar Información de Perfil
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                        Mantén actualizados tus datos de contacto para compras e interacciones. El Carnet de Identidad es inmutable.
                    </p>

                    {mensaje && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            fontWeight: 500
                        }}>
                            {mensaje}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    {buscando ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--primary)', fontWeight: 600 }}>
                            Cargando información de perfil...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Carnet de Identidad (Inmutable)
                                </label>
                                <input
                                    type="text"
                                    value={ci}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        background: 'var(--primary-bg)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'not-allowed'
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="cli-nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Nombre Completo *
                                </label>
                                <input
                                    id="cli-nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        background: '#ffffff',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="cli-celular" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Número de Celular *
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    background: '#ffffff',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{
                                        padding: '10px 12px',
                                        background: '#f3f4f6',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        borderRight: '1px solid var(--border-color)',
                                        fontWeight: 600,
                                        userSelect: 'none'
                                    }}>
                                        +591
                                    </span>
                                    <input
                                        id="cli-celular"
                                        type="tel"
                                        maxLength={8}
                                        value={celular}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setCelular(val);
                                        }}
                                        required
                                        style={{
                                            flexGrow: 1,
                                            padding: '10px 12px',
                                            border: 'none',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            background: 'transparent',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Ingresa exactamente 8 dígitos (debe comenzar con 6 o 7).
                                </p>
                            </div>

                            <div>
                                <label htmlFor="cli-pin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Cambiar PIN (Dejar vacío para no modificar)
                                </label>
                                <input
                                    id="cli-pin"
                                    type="password"
                                    maxLength={4}
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setPin(val);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        background: '#ffffff',
                                        color: 'var(--text-primary)',
                                        letterSpacing: '0.2em'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                style={{
                                    background: 'var(--secondary)',
                                    color: '#ffffff',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: cargando ? 'not-allowed' : 'pointer',
                                    marginTop: '12px',
                                    width: '100%',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'background var(--transition-speed)'
                                }}
                                onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                                onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--secondary)'; }}
                            >
                                {cargando ? 'Actualizando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};
