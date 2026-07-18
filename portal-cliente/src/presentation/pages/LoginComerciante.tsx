import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { PasswordInput } from '../components/PasswordInput';

export const LoginComerciante: React.FC = () => {
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
            
            // Comprobar la sesión guardada para enrutar
            const stored = localStorage.getItem('usuario_sesion');
            if (stored) {
                const sesion = JSON.parse(stored);
                if (sesion.rol === 'SUPERADMIN') {
                    localStorage.removeItem('usuario_sesion');
                    setError("Acceso denegado. Los administradores del sistema deben ingresar por su ruta correspondiente (/superadmin/login).");
                    return;
                }
                if (sesion.rol === 'ADMIN' || sesion.rol === 'ADMIN_ASOCIACION') {
                    navigate('/admin');
                } else if (sesion.rol === 'COMERCIANTE') {
                    navigate('/panel');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/panel');
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
                {/* Logo / Icon Area */}
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
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                        Mercado Mutualista
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Ingreso exclusivo para comerciantes
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
                        <label htmlFor="ci-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Carnet de Identidad (CI)
                        </label>
                        <input
                            id="ci-input"
                            type="text"
                            placeholder="Ej. 1234567"
                            value={ci}
                            onChange={(e) => setCi(e.target.value)}
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
                        <label htmlFor="pin-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Contraseña
                        </label>
                        <PasswordInput
                            id="pin-input"
                            placeholder="••••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            style={{
                                padding: '10px 40px 10px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                background: '#ffffff',
                                color: 'var(--text-primary)',
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
                        {cargando ? 'Ingresando...' : 'Ingresar a mi Tienda'}
                    </button>
                </form>



                <div style={{ marginTop: '20px' }}>
                    <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                        ← Ir al Mercado (Volver al Catálogo)
                    </Link>
                </div>
            </div>
        </div>
    );
};
