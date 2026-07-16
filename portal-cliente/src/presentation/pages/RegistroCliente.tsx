import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const RegistroCliente: React.FC = () => {
    const { registrarCliente } = useAuthController();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [ci, setCi] = useState("");
    const [expedido, setExpedido] = useState("SC");
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [celular, setCelular] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!ci.trim() || !expedido.trim() || !pin.trim() || !nombre.trim() || !celular.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (pin.length !== 4) {
            setError("El PIN debe tener exactamente 4 dígitos.");
            return;
        }

        // Validación de celular boliviano (8 dígitos y empieza con 6 o 7)
        if (!/^[67]\d{7}$/.test(celular)) {
            setError("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
            return;
        }

        setCargando(true);
        try {
            await registrarCliente(ci, expedido, pin, nombre, celular);
            alert("¡Te has registrado exitosamente!");
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Error al registrarse.");
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
                maxWidth: '420px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '40px 32px',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                        Registro de Clientes
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Regístrate con tus datos básicos para calificar e interactuar.
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

                <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label htmlFor="reg-ci" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Carnet de Identidad (CI) *
                        </label>
                        <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                            <input
                                id="reg-ci"
                                type="text"
                                placeholder="Ej. 7777777"
                                value={ci}
                                onChange={(e) => setCi(e.target.value)}
                                required
                                style={{
                                    flexGrow: 1,
                                    width: '0',
                                    minWidth: '0',
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
                            <select 
                                value={expedido} 
                                onChange={(e) => setExpedido(e.target.value)}
                                required
                                style={{
                                    width: '80px',
                                    padding: '10px 8px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    background: '#ffffff',
                                    color: 'var(--text-primary)',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="SC">SC</option>
                                <option value="LP">LP</option>
                                <option value="CB">CB</option>
                                <option value="OR">OR</option>
                                <option value="PT">PT</option>
                                <option value="TJ">TJ</option>
                                <option value="CH">CH</option>
                                <option value="BE">BE</option>
                                <option value="PD">PD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-pin" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            PIN de Seguridad (4 dígitos) *
                        </label>
                        <input
                            id="reg-pin"
                            type="password"
                            maxLength={4}
                            placeholder="Ej. 1234"
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
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

                    <div>
                        <label htmlFor="reg-nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Nombre Completo *
                        </label>
                        <input
                            id="reg-nombre"
                            type="text"
                            placeholder="Ej. Santiago Perez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
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
                        <label htmlFor="reg-celular" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
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
                                id="reg-celular"
                                type="tel"
                                maxLength={8}
                                placeholder="Ej. 77777777"
                                value={celular}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ''); // Solo números
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
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login/cliente" state={{ from: location.state?.from || '/' }} style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
                        Inicia sesión aquí
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
