import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const ComercianteLayout: React.FC = () => {
    const { logout, usuario, esComerciante } = useAuthController();
    const navigate = useNavigate();

    // Guard (Protected Variations)
    useEffect(() => {
        if (!usuario || !esComerciante) {
            navigate('/login');
        }
    }, [usuario, esComerciante, navigate]);

    if (!usuario || !esComerciante) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header del Panel */}
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
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Panel de Comerciante</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                        Tienda: <strong>{usuario?.nombre || 'Comerciante'}</strong>
                    </span>
                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Layout Fluid Container */}
            <main className="fluid-container" style={{ flexGrow: 1 }}>
                {/* Secondary Horizontal Tabs Navigation */}
                <nav style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '24px',
                    gap: '8px'
                }}>
                    <NavLink
                        to="/panel"
                        end
                        style={({ isActive }) => ({
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none'
                        })}
                    >
                        Inicio
                    </NavLink>
                    <NavLink
                        to="/panel/mercaderia"
                        style={({ isActive }) => ({
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none'
                        })}
                    >
                        Mi Mercadería
                    </NavLink>
                    <NavLink
                        to="/panel/perfil"
                        style={({ isActive }) => ({
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none'
                        })}
                    >
                        Mi Perfil / Negocio
                    </NavLink>
                </nav>

                <Outlet />
            </main>
        </div>
    );
};
