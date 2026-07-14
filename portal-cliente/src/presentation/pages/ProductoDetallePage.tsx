import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDetalleController } from '../../application/useDetalleController';
import { CatalogoService } from '../../application/CatalogoService';


export const ProductoDetallePage: React.FC = () => {
    // 1. Extraemos el ID de la URL
    const { id } = useParams<{ id: string }>();
    
    // 2. Delegamos al controlador
    const { producto, cargando, estaAutenticado, handleMeInteresa, handleResena } = useDetalleController(id);

    const [comentario, setComentario] = useState("");
    const [calificacion, setCalificacion] = useState(5);
    const [imagenActiva, setImagenActiva] = useState<string | null>(null);

    // Mapea comerciante basado en nombre de producto
    const handleContactar = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!producto || !producto.idComerciante) return;
        try {
            await CatalogoService.contactarComerciante(producto.idComerciante, producto.id).catch(() => {});
            const message = "Hola " + (producto.nombreComerciante || "") + ". Estoy interesado en su producto: *" + producto.nombre + "* a " + producto.precio + " Bs. / " + (producto.unidadMedida || "UNIDAD") + " que vi en la app del Mercado Mutualista.";
            const url = "https://wa.me/" + (producto.telefonoComerciante || "") + "?text=" + encodeURIComponent(message);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("Error al contactar comerciante", error);
        }
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.round(rating);
        return (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[...Array(5)].map((_, i) => (
                    <svg 
                        key={i} 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill={i < fullStars ? 'var(--secondary)' : 'none'} 
                        stroke="var(--secondary)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                ))}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '6px', fontWeight: 600 }}>
                    {rating.toFixed(1)} de 5
                </span>
            </div>
        );
    };

    if (cargando) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 600
            }}>
                Cargando información del producto...
            </div>
        );
    }

    if (!producto) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
            }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Producto no encontrado</h2>
                <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                    ← Volver al Catálogo
                </Link>
            </div>
        );
    }

    const urls = producto.galeriaUrls || [];
    const imagenPrincipal = imagenActiva || (urls.length > 0 ? urls[0] : null);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            padding: '24px'
        }}>
            {/* Header / Nav Section */}
            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto 20px auto', textAlign: 'left' }}>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Volver al Catálogo
                </Link>
            </div>

            {/* Detail Layout */}
            <main style={{
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                boxSizing: 'border-box',
                textAlign: 'left'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '32px'
                }}>
                    {/* Left Column: Gallery & Upload tool */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {urls.length === 0 ? (
                            /* Imagen no disponible */
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                paddingTop: '75%', /* 4:3 Aspect Ratio */
                                background: 'var(--primary-bg)',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-light)',
                                    gap: '8px'
                                }}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Imagen no disponible</span>
                                </div>
                            </div>
                        ) : (
                            /* Galería con imagen principal y miniaturas */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                {/* Imagen principal */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    paddingTop: '75%', /* 4:3 Aspect Ratio */
                                    background: '#f9fafb',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <img 
                                        src={`http://localhost:8080${imagenPrincipal}`} 
                                        alt={producto.nombre} 
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0, width: '100%', height: '100%',
                                            objectFit: 'contain',
                                            background: '#f9fafb'
                                        }}
                                    />
                                </div>
                                
                                {/* Miniaturas */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    overflowX: 'auto',
                                    paddingBottom: '6px'
                                }}>
                                    {urls.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImagenActiva(url)}
                                            style={{
                                                width: '60px',
                                                height: '45px',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                border: imagenPrincipal === url ? '2.5px solid var(--secondary)' : '1px solid var(--border-color)',
                                                padding: 0,
                                                flexShrink: 0,
                                                background: '#f9fafb'
                                            }}
                                        >
                                            <img 
                                                src={`http://localhost:8080${url}`} 
                                                alt={`Miniatura ${i}`} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Column: Info and Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                background: 'var(--primary-bg)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                marginBottom: '12px',
                                textTransform: 'uppercase'
                            }}>
                                {producto.nombreCategoria}
                            </span>
                            
                            <h1 style={{
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                margin: '0 0 8px 0',
                                lineHeight: '1.2'
                            }}>
                                {producto.nombre}
                            </h1>

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Puesto: <strong style={{ color: 'var(--text-primary)' }}>{producto.nombreComerciante || 'Puesto Desconocido'}</strong>
                            </div>

                            {/* Ratings section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                {renderStars(producto.promedioEstrellas)}
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    <span><strong>{producto.cantidadInteresados}</strong> clientes interesados</span>
                                </div>
                            </div>

                            {/* Single outstanding price */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: producto.estaDisponible ? 'var(--primary)' : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '4px'
                                }}>
                                    <span>{producto.precio.toFixed(2)}</span>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Bs. / <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{producto.unidadMedida || 'UNIDAD'}</span>
                                    </span>
                                </div>
                                {!producto.estaDisponible && (
                                    <div style={{
                                        color: '#dc3545',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(220, 53, 69, 0.05)',
                                        border: '1px solid rgba(220, 53, 69, 0.15)',
                                        padding: '8px 12px',
                                        borderRadius: '6px'
                                    }}>
                                        ⚠️ Agotado temporalmente. No se admiten pedidos de este producto.
                                    </div>
                                )}
                            </div>

                            {/* Descripción del Producto */}
                            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Sobre este producto
                                </h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                                    {producto.descripcion || 'El comerciante no ha ingresado una descripción para este producto.'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
                            {producto.estaDisponible && (
                                <button 
                                    onClick={handleContactar}
                                    style={{
                                        flexGrow: 1,
                                        background: 'var(--secondary)',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        padding: '12px 20px',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    Contactar por WhatsApp
                                </button>
                            )}

                            <button 
                                onClick={handleMeInteresa}
                                style={{
                                    background: 'var(--primary-bg)',
                                    color: 'var(--primary-dark)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '6px',
                                    padding: '12px 20px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary)';
                                    e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-bg)';
                                    e.currentTarget.style.color = 'var(--primary-dark)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                Me Interesa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews and comments section */}
                <section style={{ borderTop: '1px solid var(--border-color)', marginTop: '36px', paddingTop: '32px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 700 }}>
                        Opiniones de clientes
                    </h3>

                    {!estaAutenticado ? (
                        <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '32px' }}>
                            Debes iniciar sesión para dejar una opinión.
                        </div>
                    ) : (
                        <div style={{
                            background: '#ffffff',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            marginBottom: '32px'
                        }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Deja tu reseña
                            </h4>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    Calificación:
                                </label>
                                <select 
                                    value={calificacion} 
                                    onChange={e => setCalificacion(Number(e.target.value))}
                                    style={{
                                        background: '#ffffff',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value={5}>5 Estrellas (Excelente)</option>
                                    <option value={4}>4 Estrellas (Bueno)</option>
                                    <option value={3}>3 Estrellas (Regular)</option>
                                    <option value={2}>2 Estrellas (Malo)</option>
                                    <option value={1}>1 Estrella (Muy malo)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    Comentario:
                                </label>
                                <textarea 
                                    rows={3} 
                                    placeholder="Escribe tu comentario sobre el producto..." 
                                    value={comentario} 
                                    onChange={e => setComentario(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: '#ffffff',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <button 
                                onClick={async () => {
                                    if (!comentario.trim()) return alert("Por favor escribe un comentario");
                                    await handleResena(calificacion, comentario);
                                    setComentario(""); // Limpiar campo tras éxito
                                }} 
                                style={{
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    padding: '10px 20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                            >
                                Enviar Reseña
                            </button>
                        </div>
                    )}
                    
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                        Comentarios recientes
                    </h4>

                    {producto.comentarios.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
                            Aún no hay comentarios para este producto. ¡Sé el primero en opinar!
                        </p>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {producto.comentarios.map((c, index) => (
                                <li 
                                    key={index} 
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid var(--border-color)',
                                        padding: '16px 20px',
                                        borderRadius: '6px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.5
                                    }}
                                >
                                    {c}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};
