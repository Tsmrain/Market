import React, { useState, useEffect } from 'react';
import { ComercianteService } from '../../application/ComercianteService';
import { useAuthController } from '../../application/useAuthController';

interface UploadMultimediaProps {
    idProducto: number;
    onUploadSuccess: () => void;
}

export const UploadMultimedia: React.FC<UploadMultimediaProps> = ({ idProducto, onUploadSuccess }) => {
    const { usuario } = useAuthController();
    const [subiendo, setSubiendo] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [archivos, setArchivos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const objectUrls = archivos.map(file => URL.createObjectURL(file));
        setPreviews(objectUrls);
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [archivos]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const nuevos: File[] = Array.from(fileList);

        // Validación Client-Side (Regla de Negocio: Max 5MB)
        const limiteSize = 5 * 1024 * 1024; // 5 Megabytes
        for (const archivo of nuevos) {
            if (archivo.size > limiteSize) {
                alert(`El archivo ${archivo.name} es muy pesado. Por favor elija imágenes de máximo 5MB para ahorrar sus datos móviles.`);
                e.target.value = ""; // Limpiar input
                setArchivos([]);
                return;
            }
        }
        setArchivos(nuevos);
    };

    const handleUpload = async () => {
        if (!usuario || archivos.length === 0) return;
        setSubiendo(true);
        setMensaje("Subiendo y optimizando archivos...");
        try {
            await ComercianteService.subirMultimedia(usuario.id, idProducto, archivos);
            setMensaje("Archivos cargados con éxito.");
            setArchivos([]);
            // Limpiar el input de tipo archivo
            const fileInput = document.getElementById("multimedia-upload-input") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            onUploadSuccess();
        } catch (error) {
            console.error(error);
            setMensaje("Error al subir los archivos multimedia.");
        } finally {
            setSubiendo(false);
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
                Galería
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
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
                    Seleccionar Fotos
                    <input 
                        id="multimedia-upload-input"
                        type="file" 
                        multiple 
                        accept="image/*,video/mp4" 
                        onChange={handleFileChange}
                        disabled={subiendo}
                        style={{ display: 'none' }}
                    />
                </label>

                {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0' }}>
                        {previews.map((url, idx) => (
                            <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <img src={url} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                {archivos.length > 0 && (
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={subiendo}
                        style={{
                            background: 'var(--primary)',
                            color: '#ffffff',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: subiendo ? 'not-allowed' : 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => { if (!subiendo) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                        onMouseLeave={(e) => { if (!subiendo) e.currentTarget.style.background = 'var(--primary)'; }}
                    >
                        {subiendo ? 'Subiendo...' : 'Subir Fotos Seleccionadas'}
                    </button>
                )}
            </div>
            
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
