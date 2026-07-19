import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const AdminLayout: React.FC = () => {
    const { logout, usuario, esAdmin } = useAuthController();
    const navigate = useNavigate();

    // Route Guard (Protected Variations)
    useEffect(() => {
        if (!usuario || !esAdmin) {
            navigate('/login');
        }
    }, [usuario, esAdmin, navigate]);

    if (!usuario || !esAdmin) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header Administrativo */}
            <header style={{
                background: 'var(--primary-dark)',
                color: '#ffffff',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                        {usuario.nombreAsociacion
                            ? `Portal Administrativo de ${usuario.nombreAsociacion}`
                            : 'Portal Administrativo'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                        Ver Catálogo Público
                    </Link>
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
                        to="/admin/dashboard"
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
                        Métricas y Rendimiento
                    </NavLink>
                    <NavLink
                        to="/admin/comerciantes"
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
                        Gestión de Comerciantes
                    </NavLink>

                    <NavLink
                        to="/admin/recaudacion"
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
                        Factura del Sistema
                    </NavLink>
                </nav>

                <Outlet />
            </main>
        </div>
    );
};
