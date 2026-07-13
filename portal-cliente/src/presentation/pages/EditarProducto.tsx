import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { CatalogoService } from '../../application/CatalogoService';

export const EditarProducto: React.FC = () => {
    const { usuario, esComerciante } = useAuthController();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [archivos, setArchivos] = useState<File[]>([]);
    const [cargando, setCargando] = useState(false);
    const [buscando, setBuscando] = useState(true);
    const [error, setError] = useState("");

    // 1. Validar guardia de sesión
    useEffect(() => {
        if (!esComerciante || !usuario) {
            navigate('/login');
        }
    }, [usuario, esComerciante, navigate]);

    // 2. Cargar detalle actual del producto
    useEffect(() => {
        if (!id) return;
        const cargarDetalle = async () => {
            setBuscando(true);
            try {
                const prod = await CatalogoService.obtenerDetalle(parseInt(id));
                setNombre(prod.nombre);
                setPrecio(prod.precio.toString());
                setNombreCategoria(prod.nombreCategoria);
            } catch (err: any) {
                console.error(err);
                setError("No se pudo cargar la información del producto.");
            } finally {
                setBuscando(false);
            }
        };
        cargarDetalle();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList) return;
        setArchivos(Array.from(fileList));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim() || !precio.trim() || !id) return;

        // Validar tamaño máximo de archivos en cliente (Max 5MB)
        const limiteSize = 5 * 1024 * 1024;
        for (const archivo of archivos) {
            if (archivo.size > limiteSize) {
                alert(`El archivo ${archivo.name} supera los 5MB permitidos. Por favor reduce su tamaño.`);
                return;
            }
        }

        setCargando(true);
        try {
            await CatalogoService.editarProducto(
                usuario!.id,
                parseInt(id),
                nombre,
                parseFloat(precio),
                archivos
            );
            alert("¡Producto editado exitosamente!");
            navigate('/panel/catalogo');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al actualizar el producto.");
        } finally {
            setCargando(false);
        }
    };

    if (!usuario || !esComerciante) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="9" x2="15" y2="9" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Panel de Comerciante</span>
                </div>
                <Link to="/panel/catalogo" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '4px' }}>
                    ← Cancelar y Volver
                </Link>
            </header>

            {/* Form layout */}
            <main style={{
                flexGrow: 1,
                padding: '40px 24px',
                maxWidth: '550px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '32px',
                    boxShadow: 'var(--shadow-md)',
                    textAlign: 'left'
                }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                        Editar Producto
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                        Modifica los datos del producto seleccionado. Recuerda que la categoría no puede cambiarse.
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

                    {buscando ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--primary)', fontWeight: 600 }}>
                            Cargando información del producto...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label htmlFor="edit-nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Nombre del Producto *
                                </label>
                                <input
                                    id="edit-nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        background: '#ffffff',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label htmlFor="edit-precio" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        Precio (Bs.) *
                                    </label>
                                    <input
                                        id="edit-precio"
                                        type="number"
                                        step="0.01"
                                        value={precio}
                                        onChange={e => setPrecio(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            background: '#ffffff',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        Categoría (Inmutable)
                                    </label>
                                    <div style={{
                                        padding: '10px 12px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--primary-bg)',
                                        color: 'var(--primary-dark)',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'not-allowed'
                                    }}>
                                        {nombreCategoria || 'Sin Categoría'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-archivos" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Cargar Nuevas Fotos (Opcional)
                                </label>
                                <input
                                    id="edit-archivos"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
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
                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '0.75rem',
                                    color: 'var(--secondary)',
                                    background: 'rgba(217, 108, 43, 0.06)',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px dashed rgba(217, 108, 43, 0.2)',
                                    lineHeight: '1.4'
                                }}>
                                    ⚠️ <strong>Nota:</strong> Si seleccionas nuevas fotos, las anteriores se borrarán y la primera será tu nueva portada del catálogo.
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                style={{
                                    background: 'var(--secondary)',
                                    color: '#ffffff',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: cargando ? 'not-allowed' : 'pointer',
                                    marginTop: '12px',
                                    width: '100%',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'background var(--transition-speed)'
                                }}
                                onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                                onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--secondary)'; }}
                            >
                                {cargando ? 'Guardando Cambios...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};
