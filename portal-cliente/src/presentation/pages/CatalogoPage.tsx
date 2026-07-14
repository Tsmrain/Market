import React from 'react';
import { useCatalogoController } from '../../application/useCatalogoController';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';

export const CatalogoPage: React.FC = () => {
    const { 
        datos, 
        cargando, 
        cambiarPagina, 
        buscarProducto,
        categorias,
        categoriaSeleccionada,
        seleccionarCategoria
    } = useCatalogoController();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-color)'
        }}>
            {/* Header Sticky */}
            <Header onSearch={buscarProducto} />

            {/* Sub-navbar / Categorías Dinámicas */}
            <nav style={{
                background: 'var(--primary)',
                padding: '8px 24px',
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                overflowX: 'auto'
            }}>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'default' }}>
                    Categorías
                </span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Opción Todos */}
                    <button 
                        onClick={() => seleccionarCategoria(undefined)}
                        style={{ 
                            color: categoriaSeleccionada === undefined ? 'var(--secondary)' : '#ffffff', 
                            fontSize: '0.85rem', 
                            fontWeight: categoriaSeleccionada === undefined ? 800 : 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            background: 'none',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'color var(--transition-speed)'
                        }}
                    >
                        Todos
                    </button>

                    {/* Categorías dinámicas */}
                    {categorias.map((cat) => (
                        <button 
                            key={cat.id} 
                            onClick={() => seleccionarCategoria(cat.id)}
                            style={{ 
                                color: categoriaSeleccionada === cat.id ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.9)', 
                                fontSize: '0.85rem', 
                                fontWeight: categoriaSeleccionada === cat.id ? 800 : 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                background: 'none',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'color var(--transition-speed)'
                            }}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                flexGrow: 1,
                padding: '32px 24px',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
                {/* Hero / Banner */}
                <div style={{
                    background: 'var(--primary-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '32px',
                    textAlign: 'left'
                }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.2'
                    }}>
                        Ahorra y compra local
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                    }}>
                        Adquiere productos frescos de múltiples puestos y recógelos en el mercado en un único recorrido optimizado.
                    </p>
                </div>

                {/* Loading state */}
                {cargando && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '8px',
                        margin: '40px 0',
                        color: 'var(--primary)',
                        fontWeight: 600
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                        <span>Cargando productos...</span>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {/* Grid */}
                {!cargando && datos && datos.content.length > 0 ? (
                    <div className="products-grid">
                        {datos.content.map(producto => (
                            <ProductCard key={producto.id} producto={producto} />
                        ))}
                    </div>
                ) : (
                    !cargando && (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 0',
                            color: 'var(--text-secondary)'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p style={{ fontSize: '1rem', fontWeight: 500 }}>No se encontraron productos en esta categoría.</p>
                        </div>
                    )
                )}

                {/* Pagination */}
                {!cargando && datos && (
                    <Pagination 
                        currentPage={datos.number} 
                        totalPages={datos.totalPages} 
                        onPageChange={cambiarPagina} 
                    />
                )}
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                background: '#ffffff',
                padding: '24px 0',
                color: 'var(--text-light)',
                fontSize: '0.85rem',
                textAlign: 'center',
                marginTop: 'auto'
            }}>
                © {new Date().getFullYear()} Mercado Mutualista
            </footer>
        </div>
    );
};
