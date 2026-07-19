import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { PasswordInput } from '../components/PasswordInput';

export const LoginSuperAdmin: React.FC = () => {
    const { loginComerciante } = useAuthController();
    const navigate = useNavigate();
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
        if (!pin.trim()) {
            setError("Por favor ingresa tu contraseña");
            return;
        }

        setCargando(true);
        try {
            await loginComerciante(ci, pin);

            const stored = localStorage.getItem('usuario_sesion');
            if (stored) {
                const sesion = JSON.parse(stored);
                if (sesion.rol !== 'SUPERADMIN') {
                    localStorage.removeItem('usuario_sesion');
                    setError("Acceso denegado. Esta ruta es de uso exclusivo para el Administrador del Sistema.");
                    return;
                }
                navigate('/superadmin');
            } else {
                setError("Error al iniciar sesión");
            }
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
            background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
            padding: '20px',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '40px 36px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                color: '#f8fafc'
            }}>
                {/* Shield Icon Area */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        marginBottom: '16px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                        Portal de Infraestructura
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                        Acceso exclusivo para el Administrador del Sistema
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '24px',
                        textAlign: 'left',
                        lineHeight: '1.4'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div>
                        <label htmlFor="ci-superadmin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                            Carnet de Identidad (CI)
                        </label>
                        <input
                            id="ci-superadmin"
                            type="text"
                            value={ci}
                            onChange={(e) => setCi(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                        />
                    </div>

                    <div>
                        <label htmlFor="pass-superadmin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                            Contraseña del Sistema
                        </label>
                        <PasswordInput
                            id="pass-superadmin"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                padding: '12px 40px 12px 14px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                background: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            padding: '14px',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: cargando ? 'not-allowed' : 'pointer',
                            marginTop: '10px',
                            width: '100%',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = '#1d4ed8'; }}
                        onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = '#2563eb'; }}
                    >
                        {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={{ marginTop: '28px' }}>
                    <Link to="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        ← Volver al Portal del Mercado
                    </Link>
                </div>
            </div>
        </div>
    );
};
