import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductoResumen } from '../../domain/models';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    producto: ProductoResumen;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
    const { t } = useTranslation();

    const tCategory = (cat: string) => {
        const c = cat || 'CAT_GENERAL';
        return t(c.startsWith('CAT_') ? c : `CAT_${c.toUpperCase()}`);
    };

    const tUnit = (unit: string) => {
        const u = (unit || 'UNIDAD').toUpperCase();
        return t(u.startsWith('UNIT_') ? u : `UNIT_${u}`);
    };

    // Retorna un SVG limpio según el nombre del producto en lugar de usar emojis
    const getProductIcon = (nombre: string) => {
        const lower = nombre.toLowerCase();
        
        if (lower.includes('tomate') || lower.includes('platano') || lower.includes('plátano') || lower.includes('frutilla') || lower.includes('naranja')) {
            return (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6V2" />
                    <path d="M12 12h.01" />
                </svg>
            );
        }
        
        if (lower.includes('hamburguesa') || lower.includes('salchipapa') || lower.includes('jugo')) {
            return (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11h18a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
                    <path d="M12 2v9" />
                    <path d="M8 5h8" />
                </svg>
            );
        }

        if (lower.includes('arroz') || lower.includes('aceite')) {
            return (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            );
        }

        return (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
        );
    };

    return (
        <Link 
            to={`/productos/${producto.id}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-speed), box-shadow var(--transition-speed)',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            {/* Image container: Ratio 4:3, object-fit: cover */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '75%', /* 4:3 Aspect Ratio */
                background: 'var(--primary-bg)',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '12px'
            }}>
                {!producto.estaDisponible && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: '#4b5563', // Neutral gray
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        zIndex: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        Agotado temporalmente
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: producto.estaDisponible ? 'none' : 'grayscale(100%) opacity(0.6)'
                }}>
                    {producto.imagenPrincipal ? (
                        <img 
                            src={`http://localhost:8080${producto.imagenPrincipal}`}
                            alt={producto.nombre}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        getProductIcon(producto.nombre)
                    )}
                </div>
            </div>

            {/* Info */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                <div>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        background: 'var(--primary-bg)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        marginBottom: '6px'
                    }}>
                        {tCategory(producto.nombreCategoria)}
                    </span>
                    
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        lineHeight: '1.3',
                        color: 'var(--text-primary)',
                        margin: '0 0 4px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.6rem' /* Limits display to exactly 2 lines maximum */
                    }}>
                        {producto.nombre}
                    </h3>
                    
                    {producto.marca && (
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af', // Subtle text-light gray
                            fontWeight: 500,
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Marca: {producto.marca}
                        </div>
                    )}
                    
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 8px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4',
                        height: '2.24rem'
                    }}>
                        {producto.descripcion || 'Sin descripción'}
                    </p>
                </div>

                <div style={{ marginTop: '8px' }}>
                    {/* Unique clear price */}
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '2px'
                    }}>
                        <span>{producto.precio.toFixed(2)}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Bs. / <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{tUnit(producto.unidadMedida)}</span>
                        </span>
                    </div>

                    <div style={{
                        width: '100%',
                        background: 'var(--secondary)',
                        color: '#ffffff',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)',
                        boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                    >
                        {producto.estaDisponible ? 'Ver detalle / Comprar' : 'Ver detalle'}
                    </div>
                </div>
            </div>
        </Link>
    );
};
