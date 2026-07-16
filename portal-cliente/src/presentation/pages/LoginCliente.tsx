import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const LoginCliente: React.FC = () => {
    const { loginCliente } = useAuthController();
    const navigate = useNavigate();
    const location = useLocation();
    const [ci, setCi] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!ci.trim()) {
            setError("Por favor ingresa tu Carnet de Identidad");
            return;
        }
        if (pin.length !== 4) {
            setError("El PIN debe tener exactamente 4 dígitos");
            return;
        }

        setCargando(true);
        try {
            await loginCliente(ci, pin);
            alert("¡Ingreso exitoso!");
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '40px 32px',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        marginBottom: '16px'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                        Ingreso de Clientes
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Accede para ver y calificar productos.
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label htmlFor="client-ci" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Carnet de Identidad (CI) *
                        </label>
                        <input
                            id="client-ci"
                            type="text"
                            placeholder="Ej. 7777777"
                            value={ci}
                            onChange={(e) => setCi(e.target.value)}
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
                        <label htmlFor="client-pin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            PIN de 4 dígitos *
                        </label>
                        <input
                            id="client-pin"
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // Solo números
                                setPin(val);
                            }}
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
                            marginTop: '8px',
                            width: '100%',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'background var(--transition-speed)'
                        }}
                        onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                        onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--secondary)'; }}
                    >
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    ¿No tienes una cuenta?{' '}
                    <Link to="/registro/cliente" state={{ from: location.state?.from || '/' }} style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
                        Regístrate aquí
                    </Link>
                </div>

                <div style={{ marginTop: '16px' }}>
                    <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                        ← Volver al Catálogo Público
                    </Link>
                </div>
            </div>
        </div>
    );
};
