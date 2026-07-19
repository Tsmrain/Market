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
        seleccionarCategoria,
        inputPrecioMin,
        setInputPrecioMin,
        inputPrecioMax,
        setInputPrecioMax,
        inputEstrellas,
        setInputEstrellas,
        aplicarFiltros,
        limpiarFiltros
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

            {/* Main Content */}
            <main className="catalogo-main" style={{
                flexGrow: 1,
                padding: '32px 24px',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
                <style>{`
                    .catalogo-main {
                        display: grid;
                        grid-template-columns: 260px 1fr;
                        gap: 32px;
                    }
                    @media (max-width: 768px) {
                        .catalogo-main {
                            grid-template-columns: 1fr;
                            gap: 24px;
                        }
                    }
                `}</style>
                {/* Columna Izquierda: Barra Lateral de Filtros */}
                <aside style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '24px',
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'left'
                }}>
                    {/* Lista Vertical de Categorías */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Categorías
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button 
                                onClick={() => seleccionarCategoria(undefined)}
                                style={{
                                    textAlign: 'left',
                                    padding: '8px 12px',
                                    background: categoriaSeleccionada === undefined ? 'rgba(37, 99, 235, 0.08)' : 'none',
                                    color: categoriaSeleccionada === undefined ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: categoriaSeleccionada === undefined ? 700 : 500,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                Todas las Categorías
                            </button>
                            {categorias.map((cat) => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => seleccionarCategoria(cat.id)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        background: categoriaSeleccionada === cat.id ? 'rgba(37, 99, 235, 0.08)' : 'none',
                                        color: categoriaSeleccionada === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: categoriaSeleccionada === cat.id ? 700 : 500,
                                        fontSize: '0.85rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                    {/* Filtro de Rango de Precios */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Rango de Precio (Bs.)
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="number" 
                                placeholder="Mín" 
                                value={inputPrecioMin}
                                onChange={e => setInputPrecioMin(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: 'var(--text-primary)',
                                    background: '#ffffff'
                                }}
                            />
                            <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>-</span>
                            <input 
                                type="number" 
                                placeholder="Máx" 
                                value={inputPrecioMax}
                                onChange={e => setInputPrecioMax(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: 'var(--text-primary)',
                                    background: '#ffffff'
                                }}
                            />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                    {/* Selector de Calidad Mínima */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Calificación Mínima
                        </h4>
                        <select 
                            value={inputEstrellas || ""} 
                            onChange={e => setInputEstrellas(e.target.value ? Number(e.target.value) : undefined)}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                outline: 'none',
                                cursor: 'pointer',
                                background: '#ffffff',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">Cualquier Calificación</option>
                            <option value="5">5 Estrellas</option>
                            <option value="4">4 Estrellas o más</option>
                            <option value="3">3 Estrellas o más</option>
                            <option value="2">2 Estrellas o más</option>
                            <option value="1">1 Estrella o más</option>
                        </select>
                    </div>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <button 
                            onClick={aplicarFiltros}
                            style={{
                                background: 'var(--primary)',
                                color: '#ffffff',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'background var(--transition-speed)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                        >
                            Aplicar Filtros
                        </button>
                        <button 
                            onClick={limpiarFiltros}
                            style={{
                                background: '#f3f4f6',
                                color: 'var(--text-secondary)',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background var(--transition-speed)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </aside>

                {/* Columna Derecha: Grilla de Productos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                                <p style={{ fontSize: '1rem', fontWeight: 500 }}>No se encontraron productos con los filtros seleccionados.</p>
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
                </div>
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
