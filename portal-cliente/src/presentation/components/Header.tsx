import React from 'react';
import { useAuthController } from '../../application/useAuthController';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
    const { usuario, logout } = useAuthController();
    const { t } = useTranslation();

    return (
        <header className="app-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'var(--primary-dark)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            color: '#ffffff',
            gap: '16px',
            flexWrap: 'wrap'
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .app-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        padding: 12px 16px !important;
                        gap: 12px !important;
                    }
                    .app-header-search {
                        max-width: 100% !important;
                        width: 100% !important;
                        order: 3;
                    }
                    .app-header-logo {
                        justify-content: center;
                    }
                    .app-header-actions {
                        justify-content: center;
                        width: 100%;
                        order: 2;
                    }
                }
            `}</style>
            {/* Logo */}
            <div className="app-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                    Mercado <span style={{ color: 'var(--secondary)' }}>Mutualista</span>
                </span>
            </div>

            {/* Search Bar */}
            <div className="app-header-search" style={{
                display: 'flex',
                flexGrow: 1,
                maxWidth: '600px',
                minWidth: '260px',
                borderRadius: '6px',
                overflow: 'hidden',
                background: '#ffffff',
                border: '2px solid transparent',
                transition: 'border-color var(--transition-speed)'
            }}
            onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--secondary)'}
            onBlurCapture={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
                <input 
                    type="text" 
                    placeholder={t('buscar_productos')} 
                    onChange={(e) => onSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 16px',
                        fontSize: '0.95rem',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)'
                    }}
                />
                <div style={{
                    background: 'var(--secondary)',
                    width: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>

            {/* Profile Section & User Details */}
            <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {usuario && usuario.id !== 500 ? (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>{usuario.nombre}</span>
                            </div>
                            {usuario.rol === 'CLIENTE' && (
                                <a 
                                    href="/perfil"
                                    style={{
                                        color: '#ffffff',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '4px',
                                        padding: '4px 10px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {t('mi_perfil')}
                                </a>
                            )}
                            {usuario.rol !== 'CLIENTE' && (
                                <a 
                                    href={usuario.rol === 'ADMIN' ? "/admin" : "/panel"}
                                    style={{
                                        color: '#ffffff',
                                        background: 'var(--secondary)',
                                        borderRadius: '4px',
                                        padding: '4px 10px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {t('panel')} →
                                </a>
                            )}
                            <button 
                                onClick={logout}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '4px',
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            >
                                {t('salir')}
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <a 
                                href="/login/cliente"
                                style={{
                                    color: '#ffffff',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                            >
                                {t('ingresar')}
                            </a>
                            <a 
                                href="/registro/cliente"
                                style={{
                                    color: '#ffffff',
                                    background: 'var(--secondary)',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                }}
                            >
                                {t('registrarse')}
                            </a>
                            <a 
                                href="/login"
                                style={{
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    padding: '6px 8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    opacity: 0.8
                                }}
                            >
                                {t('comerciantes')}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
