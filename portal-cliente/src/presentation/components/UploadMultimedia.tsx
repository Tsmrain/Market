import React, { useState } from 'react';
import { CatalogoService } from '../../application/CatalogoService';

interface UploadMultimediaProps {
    idProducto: number;
    onUploadSuccess: () => void;
}

export const UploadMultimedia: React.FC<UploadMultimediaProps> = ({ idProducto, onUploadSuccess }) => {
    const [subiendo, setSubiendo] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const archivos: File[] = Array.from(fileList);

        // Validación Client-Side (Regla de Negocio: Max 5MB)
        const limiteSize = 5 * 1024 * 1024; // 5 Megabytes
        for (const archivo of archivos) {
            if (archivo.size > limiteSize) {
                alert(`El archivo ${archivo.name} es muy pesado. Por favor elija imágenes de máximo 5MB para ahorrar sus datos móviles.`);
                e.target.value = ""; // Limpiar input
                return;
            }
        }

        setSubiendo(true);
        setMensaje("Subiendo y optimizando archivos...");
        try {
            await CatalogoService.subirMultimedia(idProducto, archivos);
            setMensaje("Archivos cargados con éxito.");
            onUploadSuccess();
        } catch (error) {
            console.error(error);
            setMensaje("Error al subir los archivos multimedia.");
        } finally {
            setSubiendo(false);
            e.target.value = ""; // Limpiar input
        }
    };

    return (
        <div style={{
            background: 'var(--primary-bg)',
            border: '1px dashed var(--primary)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginTop: '24px'
        }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 700 }}>
                Agregar fotos a la galería
            </h4>
            
            <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--secondary)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: subiendo ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                {subiendo ? 'Subiendo...' : 'Seleccionar Fotos'}
                <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/mp4" 
                    onChange={handleFileChange}
                    disabled={subiendo}
                    style={{ display: 'none' }}
                />
            </label>
            
            {mensaje && (
                <p style={{ 
                    marginTop: '10px', 
                    fontSize: '0.85rem', 
                    color: subiendo ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    fontWeight: 500
                }}>
                    {mensaje}
                </p>
            )}
        </div>
    );
};
