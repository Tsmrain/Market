import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const SuperAdminLayout: React.FC = () => {
    const { logout, usuario, esSuperAdmin } = useAuthController();
    const navigate = useNavigate();

    // Route Guard (Protected Variations)
    useEffect(() => {
        if (!usuario || !esSuperAdmin) {
            navigate('/login');
        }
    }, [usuario, esSuperAdmin, navigate]);

    if (!usuario || !esSuperAdmin) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header SuperAdmin */}
            <header style={{
                background: '#111827',
                color: '#ffffff',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Super Administrador del Sistema</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a
                        href="/"
                        style={{
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginRight: '8px'
                        }}
                    >
                        Ver Catálogo Público
                    </a>
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
                }}>                    <NavLink
                        to="/superadmin/asociaciones"
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
                        Asociaciones
                    </NavLink>
                    <NavLink
                        to="/superadmin/administradores"
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
                        Administradores
                    </NavLink>
                    <NavLink
                        to="/superadmin/categorias"
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
                        Categorías
                    </NavLink>
                    <NavLink
                        to="/superadmin/unidades"
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
                        Datos Maestros (Unidades)
                    </NavLink>
                    <NavLink
                        to="/superadmin/dashboard"
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
                        to="/superadmin/liquidaciones"
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
                        Liquidaciones
                    </NavLink>
                    <NavLink
                        to="/superadmin/configuracion"
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
                        Configuración del Sistema
                    </NavLink>
                </nav>

                <Outlet />
            </main>
        </div>
    );
};
