import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '32px',
            marginBottom: '32px'
        }}>
            {/* Button Anterior */}
            <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: currentPage === 0 ? 'rgba(0,0,0,0.02)' : 'var(--card-bg)',
                    color: currentPage === 0 ? 'var(--text-light)' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                    if (currentPage !== 0) e.currentTarget.style.background = 'var(--primary-bg)';
                }}
                onMouseLeave={(e) => {
                    if (currentPage !== 0) e.currentTarget.style.background = 'var(--card-bg)';
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Anterior
            </button>

            {/* Current status */}
            <span style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                padding: '0 8px'
            }}>
                Página <strong style={{ color: 'var(--text-primary)' }}>{currentPage + 1}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
            </span>

            {/* Button Siguiente */}
            <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: currentPage >= totalPages - 1 ? 'rgba(0,0,0,0.02)' : 'var(--card-bg)',
                    color: currentPage >= totalPages - 1 ? 'var(--text-light)' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                    if (currentPage < totalPages - 1) e.currentTarget.style.background = 'var(--primary-bg)';
                }}
                onMouseLeave={(e) => {
                    if (currentPage < totalPages - 1) e.currentTarget.style.background = 'var(--card-bg)';
                }}
            >
                Siguiente
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </div>
    );
};
