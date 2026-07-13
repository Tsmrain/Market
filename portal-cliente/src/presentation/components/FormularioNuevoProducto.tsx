import React, { useState, useEffect } from 'react';
import { CatalogoService } from '../../application/CatalogoService';
import type { CategoriaInfo } from '../../domain/models';

interface FormularioNuevoProductoProps {
    idComerciante: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const FormularioNuevoProducto: React.FC<FormularioNuevoProductoProps> = ({ idComerciante, onSuccess, onCancel }) => {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [idCategoria, setIdCategoria] = useState("");
    const [categorias, setCategorias] = useState<CategoriaInfo[]>([]);
    const [archivos, setArchivos] = useState<File[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    // Cargar categorías al montar
    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await CatalogoService.obtenerTodasLasCategorias();
                setCategorias(data);
                if (data.length > 0) {
                    setIdCategoria(data[0].id.toString());
                }
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar las categorías. Intenta más tarde.");
            }
        };
        cargar();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList) return;
        setArchivos(Array.from(fileList));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim() || !precio.trim() || !idCategoria) {
            setError("Por favor completa todos los campos requeridos.");
            return;
        }

        // REGLA DE NEGOCIO: Multimedia Obligatoria
        if (archivos.length === 0) {
            setError("Debe subir al menos una imagen del producto.");
            return;
        }

        // REGLA DE NEGOCIO: Validación de tamaño (Máx 5MB)
        const limiteSize = 5 * 1024 * 1024;
        for (const archivo of archivos) {
            if (archivo.size > limiteSize) {
                alert(`El archivo ${archivo.name} es muy pesado. Por favor elija imágenes de máximo 5MB para ahorrar sus datos móviles.`);
                return;
            }
        }

        setCargando(true);
        try {
            await CatalogoService.agregarProducto(
                idComerciante,
                nombre,
                parseFloat(precio),
                parseInt(idCategoria),
                archivos
            );
            alert("¡Producto creado exitosamente!");
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al registrar el producto.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 61, 82, 0.6)', /* primary-dark translucido */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                padding: '32px',
                boxShadow: 'var(--shadow-md)',
                boxSizing: 'border-box',
                textAlign: 'left'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--primary-dark)',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.02em'
                }}>
                    Agregar Nuevo Producto
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                    Registra un nuevo artículo en tu catálogo. Todos los campos marcados con (*) son obligatorios.
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label htmlFor="prod-nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Nombre del Producto *
                        </label>
                        <input
                            id="prod-nombre"
                            type="text"
                            placeholder="Ej. Manzanas Criollas"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: '#ffffff',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label htmlFor="prod-precio" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Precio (Bs.) *
                            </label>
                            <input
                                id="prod-precio"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={precio}
                                onChange={e => setPrecio(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    background: '#ffffff',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <label htmlFor="prod-categoria" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Categoría *
                            </label>
                            <select
                                id="prod-categoria"
                                value={idCategoria}
                                onChange={e => setIdCategoria(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    background: '#ffffff',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="prod-archivos" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Imágenes del Producto * (Máx 5MB)
                        </label>
                        <input
                            id="prod-archivos"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: '#f9fafb',
                                color: 'var(--text-secondary)'
                            }}
                        />
                    </div>

                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={cargando}
                            style={{
                                flexGrow: 1,
                                background: 'var(--primary-bg)',
                                color: 'var(--primary-dark)',
                                border: '1px solid var(--primary)',
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            style={{
                                flexGrow: 2,
                                background: 'var(--secondary)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                            onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--secondary)'; }}
                        >
                            {cargando && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                            )}
                            {cargando ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
