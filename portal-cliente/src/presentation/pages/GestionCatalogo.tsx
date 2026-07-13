import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { CatalogoService } from '../../application/CatalogoService';
import { FormularioNuevoProducto } from '../components/FormularioNuevoProducto';
import type { ProductoComerciante } from '../../domain/models';

export const GestionCatalogo: React.FC = () => {
    const { usuario, esComerciante, logout } = useAuthController();
    const navigate = useNavigate();
    const [productos, setProductos] = useState<ProductoComerciante[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [recargar, setRecargar] = useState(0);

    // 1. Regla Arquitectónica: Gestión de Sesión
    useEffect(() => {
        if (!esComerciante || !usuario) {
            navigate('/login');
        }
    }, [usuario, esComerciante, navigate]);

    // Cargar productos del comerciante
    useEffect(() => {
        if (!usuario) return;
        const cargar = async () => {
            setCargando(true);
            try {
                const data = await CatalogoService.obtenerMisProductos(usuario.id);
                setProductos(data);
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar tus productos.");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [usuario, recargar]);

    const handleAlternarDisponibilidad = async (idProducto: number) => {
        if (!usuario) return;
        try {
            await CatalogoService.alternarDisponibilidad(usuario.id, idProducto);
            
            // Actualizar estado local inmediatamente
            setProductos(prev => prev.map(p => {
                if (p.id === idProducto) {
                    return { ...p, estaDisponible: !p.estaDisponible };
                }
                return p;
            }));
        } catch (err: any) {
            alert(err.message || "Error al cambiar disponibilidad.");
        }
    };

    const handleEliminar = async (idProducto: number) => {
        if (!usuario) return;
        const confirmar = window.confirm("¿Está seguro de ocultar este producto del mercado?");
        if (!confirmar) return;

        try {
            await CatalogoService.eliminarProducto(usuario.id, idProducto);
            
            // Remover del estado local inmediatamente
            setProductos(prev => prev.filter(p => p.id !== idProducto));
        } catch (err: any) {
            alert(err.message || "Error al eliminar producto.");
        }
    };

    const handleSuccess = () => {
        setMostrarForm(false);
        setRecargar(prev => prev + 1); // Forzar recarga del listado
    };

    if (!usuario || !esComerciante) return null;

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
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Panel de Comerciante</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem' }}>Tienda: <strong>{usuario.nombre}</strong></span>
                    <Link to="/panel" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>
                        ← Volver al Panel
                    </Link>
                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Contenido */}
            <main style={{
                flexGrow: 1,
                padding: '40px 24px',
                maxWidth: '900px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '32px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    {/* Encabezado */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                                Mi Catálogo de Productos
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Gestiona la disponibilidad y visibilidad pública de tus artículos en el mercado.
                            </p>
                        </div>
                        <button
                            onClick={() => setMostrarForm(true)}
                            style={{
                                background: 'var(--secondary)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            + Agregar Nuevo Producto
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            marginBottom: '24px'
                        }}>
                            {error}
                        </div>
                    )}

                    {cargando ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--primary)', fontWeight: 600 }}>
                            Cargando tu catálogo de productos...
                        </div>
                    ) : productos.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 0',
                            border: '2px dashed var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="9" y1="9" x2="15" y2="9" />
                                <line x1="9" y1="13" x2="15" y2="13" />
                                <line x1="9" y1="17" x2="15" y2="17" />
                            </svg>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>No tienes productos registrados en tu catálogo.</p>
                        </div>
                    ) : (
                        /* Data Table */
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                borderSpacing: 0,
                                textAlign: 'left'
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom: '2px solid var(--border-color)'
                                    }}>
                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>ID</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Producto</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Precio</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)', textAlign: 'center' }}>Disponibilidad</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)', textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((prod) => (
                                        <tr 
                                            key={prod.id} 
                                            style={{
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232, 240, 245, 0.3)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                #{prod.id}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {prod.nombre}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                {prod.precio.toFixed(2)} Bs.
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleAlternarDisponibilidad(prod.id)}
                                                    style={{
                                                        background: prod.estaDisponible ? '#22c55e' : 'var(--border-color)',
                                                        color: prod.estaDisponible ? '#ffffff' : 'var(--text-secondary)',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '6px 16px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        boxShadow: 'var(--shadow-sm)',
                                                        transition: 'all 0.2s',
                                                        minWidth: '100px'
                                                    }}
                                                >
                                                    {prod.estaDisponible ? 'Disponible' : 'Agotado'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                <Link
                                                    to={`/panel/productos/${prod.id}/editar`}
                                                    title="Editar producto"
                                                    style={{
                                                        color: 'var(--primary)',
                                                        cursor: 'pointer',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-bg)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </Link>
                                                
                                                <button
                                                    onClick={() => handleEliminar(prod.id)}
                                                    title="Eliminar de catálogo"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Nuevo Producto */}
            {mostrarForm && (
                <FormularioNuevoProducto 
                    idComerciante={usuario.id} 
                    onSuccess={handleSuccess} 
                    onCancel={() => setMostrarForm(false)} 
                />
            )}
        </div>
    );
};
