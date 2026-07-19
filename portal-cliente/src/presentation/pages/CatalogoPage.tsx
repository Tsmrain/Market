import React, { useState, useMemo } from 'react';
import { useCatalogoController } from '../../application/useCatalogoController';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import type { CategoriaInfo } from '../../domain/models';

// ── Pure Fabrication: buildCategoryTree ──────────────────────────────────────
interface CategoriaNode extends CategoriaInfo {
    children: CategoriaNode[];
}

function buildCategoryTree(flat: CategoriaInfo[]): CategoriaNode[] {
    const map = new Map<number, CategoriaNode>();
    const roots: CategoriaNode[] = [];
    flat.forEach(c => map.set(c.id, { ...c, children: [] }));
    flat.forEach(c => {
        const node = map.get(c.id)!;
        if (c.idCategoriaPadre != null) {
            map.get(c.idCategoriaPadre)?.children.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
}

// ── Accordion Item (sub-componente puro) ─────────────────────────────────────
interface AccordionItemProps {
    node: CategoriaNode;
    categoriaSeleccionada: number | undefined;
    onSelect: (id: number | undefined) => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ node, categoriaSeleccionada, onSelect }) => {
    const hasChildren = node.children.length > 0;
    // Auto-expand si algún hijo está seleccionado
    const [expanded, setExpanded] = useState(() =>
        hasChildren && node.children.some(ch => ch.id === categoriaSeleccionada)
    );

    const isActive = categoriaSeleccionada === node.id;

    const rootBtnStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        textAlign: 'left',
        padding: '8px 10px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.88rem',
        fontWeight: isActive ? 700 : 600,
        background: isActive ? 'rgba(37,99,235,0.09)' : 'transparent',
        color: isActive ? 'var(--primary)' : 'var(--text-primary)',
        transition: 'background 0.15s',
    };

    const leafBtnStyle: React.CSSProperties = {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '6px 10px 6px 18px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: categoriaSeleccionada === node.id ? 600 : 400,
        background: 'transparent',
        color: categoriaSeleccionada === node.id ? 'var(--primary)' : 'var(--text-secondary)',
        transition: 'background 0.12s',
    };

    return (
        <div>
            <button
                style={rootBtnStyle}
                onClick={() => {
                    if (hasChildren) {
                        setExpanded(p => !p);
                    } else {
                        onSelect(node.id);
                    }
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
                <span>{node.nombre}</span>
                {hasChildren && (
                    <span style={{ fontSize: '0.7rem', opacity: 0.55, marginLeft: '6px' }}>
                        {expanded ? '▾' : '▸'}
                    </span>
                )}
            </button>

            {hasChildren && expanded && (
                <div style={{
                    borderLeft: '2px solid var(--border-color)',
                    marginLeft: '14px',
                    paddingTop: '2px',
                    paddingBottom: '4px',
                }}>
                    {node.children.map(child => (
                        <button
                            key={child.id}
                            style={{
                                ...leafBtnStyle,
                                fontWeight: categoriaSeleccionada === child.id ? 600 : 400,
                                color: categoriaSeleccionada === child.id ? 'var(--primary)' : 'var(--text-secondary)',
                                background: categoriaSeleccionada === child.id ? 'rgba(37,99,235,0.07)' : 'transparent',
                            }}
                            onClick={() => onSelect(child.id)}
                            onMouseEnter={e => {
                                if (categoriaSeleccionada !== child.id)
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background =
                                    categoriaSeleccionada === child.id ? 'rgba(37,99,235,0.07)' : 'transparent';
                            }}
                        >
                            {child.nombre}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


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
                padding: 0,
                margin: 0,
                maxWidth: '100%',
                width: '100vw',
                boxSizing: 'border-box'
            }}>
                <style>{`
                    .catalogo-main {
                        display: grid;
                        grid-template-columns: 300px 1fr;
                        gap: 0px;
                    }
                    @media (max-width: 768px) {
                        .catalogo-main {
                            grid-template-columns: 1fr;
                            gap: 0px;
                        }
                        .catalogo-sidebar {
                            border-right: none !important;
                            border-bottom: 1px solid var(--border-color) !important;
                            min-height: auto !important;
                            width: 100% !important;
                        }
                    }
                `}</style>
                {/* Columna Izquierda: Barra Lateral de Filtros */}
                <aside className="catalogo-sidebar" style={{
                    background: '#ffffff',
                    borderRight: '1px solid var(--border-color)',
                    borderLeft: 'none',
                    borderTop: 'none',
                    borderBottom: 'none',
                    borderRadius: '0px',
                    padding: '24px',
                    minHeight: '100vh',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxSizing: 'border-box'
                }}>
                    {/* Lista Jerárquica de Categorías — Acordeón */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Categorías
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {/* Botón "Todas" */}
                            <button
                                onClick={() => seleccionarCategoria(undefined)}
                                style={{
                                    textAlign: 'left',
                                    padding: '8px 10px',
                                    background: categoriaSeleccionada === undefined ? 'rgba(37,99,235,0.09)' : 'transparent',
                                    color: categoriaSeleccionada === undefined ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: categoriaSeleccionada === undefined ? 700 : 500,
                                    fontSize: '0.88rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                Todas las Categorías
                            </button>

                            {/* Árbol de acordeón */}
                            {useMemo(() => buildCategoryTree(categorias), [categorias]).map(node => (
                                <AccordionItem
                                    key={node.id}
                                    node={node}
                                    categoriaSeleccionada={categoriaSeleccionada}
                                    onSelect={seleccionarCategoria}
                                />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px 24px', boxSizing: 'border-box' }}>
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
