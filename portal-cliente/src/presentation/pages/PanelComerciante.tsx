import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';

export const PanelComerciante: React.FC = () => {
    const { usuario } = useAuthController();

    return (
        <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'left'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--primary-dark)',
                marginBottom: '12px',
                letterSpacing: '-0.02em'
            }}>
                Bienvenido a tu tienda digital
            </h2>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '28px'
            }}>
                Desde aquí puedes ver la información que tus clientes consultan en el portal público. En próximas iteraciones podrás agregar productos directamente, ver tus estadísticas de visitas y reportes de WhatsApp.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    background: 'var(--primary-bg)'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 700 }}>ID de Tienda</h4>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        #{usuario?.id || '---'}
                    </p>
                </div>

                <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    background: 'var(--primary-bg)'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Estado de la Cuenta</h4>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                        Activo
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link 
                    to="/panel/mercaderia"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--secondary)',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="9" x2="15" y2="9" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                    Gestionar mi Mercadería
                </Link>

                <Link 
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary-dark)',
                        border: '1px solid var(--primary)',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
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
                    Ir al Mercado
                </Link>
            </div>
        </div>
    );
};
