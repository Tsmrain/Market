import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDetalleController } from '../../application/useDetalleController';
import { CatalogoService } from '../../application/CatalogoService';
import { useTranslation } from 'react-i18next';

export const ProductoDetallePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const tCategory = (cat: string) => {
        const c = cat || 'CAT_GENERAL';
        return t(c.startsWith('CAT_') ? c : `CAT_${c.toUpperCase()}`);
    };

    const tUnit = (unit: string) => {
        const u = (unit || 'UNIDAD').toUpperCase();
        return t(u.startsWith('UNIT_') ? u : `UNIT_${u}`);
    };
    
    const { producto, cargando, usuario, estaAutenticado, handleMeInteresa, handleResena } = useDetalleController(id);

    const [comentario, setComentario] = useState("");
    const [calificacion, setCalificacion] = useState(5);
    const [mediaActiva, setMediaActiva] = useState<{ id?: number; url: string; tipo: string } | null>(null);

    // UC-A5 (Contactar al Comerciante) - Restringido a usuarios autenticados
    const handleContactar = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!estaAutenticado) {
            alert(t('login_required_action'));
            navigate('/login/cliente', { state: { from: location.pathname } });
            return;
        }
        if (!producto || !producto.telefonoComerciante) return;
        
        try {
            // Intenta registrar la interacción en segundo plano si está logueado
            if (usuario && usuario.id && producto.idComerciante !== undefined) {
                await CatalogoService.contactarComerciante(producto.idComerciante!, producto.id, usuario.id);
            }
        } catch (error) {
            console.error("Error al registrar contacto", error);
        }

        const telefono = producto.telefonoComerciante;
        const texto = "Hola " + (producto.nombreComerciante || "comerciante") + ". Estoy interesado en su producto: " + producto.nombre + " que vi en la plataforma del Mercado Mutualista.";
        const url = "https://wa.me/591" + telefono + "?text=" + encodeURIComponent(texto);
        window.open(url, '_blank', 'noopener,noreferrer');
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
                {t('cargando_producto')}
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
                <h2 style={{ color: 'var(--text-primary)' }}>{t('producto_no_disponible')}</h2>
                <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                    {t('atras')}
                </Link>
            </div>
        );
    }

    const galeria = producto?.galeria && producto.galeria.length > 0
        ? producto.galeria
        : (producto?.galeriaUrls || []).map((url, idx) => ({ id: idx, url, tipo: url.endsWith('.mp4') ? 'video' : 'imagen' }));

    const mediaPrincipal = mediaActiva || (galeria.length > 0 ? galeria[0] : null);

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
                    {t('atras')}
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
                    {/* Left Column: Gallery */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {galeria.length === 0 ? (
                            <div style={{
                                width: '100%',
                                height: '320px',
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-light)',
                                fontSize: '0.9rem'
                            }}>
                                Sin imagen disponible
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{
                                    width: '100%',
                                    height: '320px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {mediaPrincipal?.tipo === 'video' ? (
                                        <video 
                                            src={mediaPrincipal.url} 
                                            controls 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <img 
                                            src={mediaPrincipal?.url} 
                                            alt={producto.nombre} 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {galeria.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMediaActiva(m)}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                padding: 0,
                                                background: '#ffffff',
                                                border: mediaPrincipal?.id === m.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            {m.tipo === 'video' ? (
                                                <div style={{ width: '100%', height: '100%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    VIDEO
                                                </div>
                                            ) : (
                                                <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
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
                                {tCategory(producto.nombreCategoria)}
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

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <p style={{ margin: 0 }}><strong>{t('comerciante')}:</strong> {producto.nombreComerciante || t('no_especificado')}</p>
                                <p style={{ margin: 0 }}><strong>{t('puesto')}:</strong> {producto.numeroPuesto || t('no_especificado')}</p>
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

                            {/* Single price */}
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
                                        Bs. / <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{tUnit(producto.unidadMedida)}</span>
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
                                        Agotado temporalmente. No se admiten pedidos de este producto.
                                    </div>
                                )}
                            </div>

                            {/* Descripción */}
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
                                    {t('contactar_whatsapp')}
                                </button>
                            )}

                            <button 
                                onClick={async () => {
                                    // UC-A6 (Me interesa) - Polimorfismo: Cualquier actor autenticado
                                    if (!estaAutenticado) {
                                        alert(t('login_required_action'));
                                        navigate('/login/cliente', { state: { from: location.pathname } });
                                    } else {
                                        await handleMeInteresa();
                                    }
                                }}
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
                                    gap: '8px',
                                    cursor: 'pointer'
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
                                {t('me_interesa')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews and comments section */}
                <section style={{ borderTop: '1px solid var(--border-color)', marginTop: '36px', paddingTop: '32px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 700 }}>
                        {t('resenas_detalladas')}
                    </h3>

                    <div style={{
                        background: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '32px'
                    }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {t('opinion_cliente')}
                        </h4>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                {t('calificacion')}:
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
                                <option value={5}>5 Estrellas</option>
                                <option value={4}>4 Estrellas</option>
                                <option value={3}>3 Estrellas</option>
                                <option value={2}>2 Estrellas</option>
                                <option value={1}>1 Estrella</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Comentario:
                            </label>
                            <textarea 
                                rows={3} 
                                placeholder={t('escribe_comentario')} 
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
                                // UC-A7 (Comentar / Reseñar) - Polimorfismo: Cualquier actor autenticado
                                if (!estaAutenticado) {
                                    alert(t('login_required_action'));
                                    navigate('/login/cliente', { state: { from: location.pathname } });
                                    return;
                                }
                                if (!comentario.trim()) return alert("Por favor escribe un comentario");
                                await handleResena(calificacion, comentario);
                                setComentario("");
                            }} 
                            style={{
                                background: 'var(--primary)',
                                color: '#ffffff',
                                padding: '10px 20px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                boxShadow: 'var(--shadow-sm)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                        >
                            {t('enviar_resena')}
                        </button>
                    </div>
                    
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                        Comentarios recientes
                    </h4>

                    {(!producto.resenas || producto.resenas.length === 0) ? (
                        <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
                            {t('sin_comentarios')}
                        </p>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {producto.resenas.map((r, index) => (
                                <li 
                                    key={index} 
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid var(--border-color)',
                                        padding: '16px 20px',
                                        borderRadius: '6px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                                                {r.nombreCliente}
                                            </strong>
                                            {r.esPropietario && (
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#F97316',
                                                    fontWeight: 'bold',
                                                    marginLeft: '8px'
                                                }}>
                                                    Comerciante
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                                            {'★'.repeat(r.calificacion) + '☆'.repeat(5 - r.calificacion)}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{r.comentario}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};
