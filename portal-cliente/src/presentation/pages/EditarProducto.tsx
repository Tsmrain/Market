import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { CatalogoService } from '../../application/CatalogoService';
import { ComercianteService } from '../../application/ComercianteService';
import type { CategoriaInfo } from '../../domain/models';

export const EditarProducto: React.FC = () => {
    const { usuario, esComerciante } = useAuthController();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Text & Category fields
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [idCategoria, setIdCategoria] = useState("");
    const [unidadMedida, setUnidadMedida] = useState("UNIDAD");
    const [unidadesMaestras, setUnidadesMaestras] = useState<any[]>([]);
    const [descripcion, setDescripcion] = useState("");
    const [categorias, setCategorias] = useState<CategoriaInfo[]>([]);
    const [marca, setMarca] = useState("");

    // Multimedia gallery state
    const [galeriaActual, setGaleriaActual] = useState<Array<{ id: number; url: string; tipo: string }>>([]);
    const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);

    // Loading states
    const [cargando, setCargando] = useState(false);
    const [cargandoMultimedia, setCargandoMultimedia] = useState(false);
    const [buscando, setBuscando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    // 1. Validar guardia de sesión
    useEffect(() => {
        if (!esComerciante || !usuario) {
            navigate('/login');
        }
    }, [usuario, esComerciante, navigate]);

    // 2. Cargar detalle actual del producto y lista de categorías
    const cargarDatos = async () => {
        if (!id) return;
        setBuscando(true);
        try {
            const [cats, unis, prod] = await Promise.all([
                CatalogoService.obtenerTodasLasCategorias(),
                CatalogoService.obtenerUnidades(),
                CatalogoService.obtenerDetalle(parseInt(id))
            ]);
            setCategorias(cats);
            setUnidadesMaestras(unis);

            setNombre(prod.nombre);
            setPrecio(prod.precio.toString());
            const unit = prod.unidadMedida || "UNIDAD";
            setDescripcion(prod.descripcion || "");
            setMarca(prod.marca || "");
            setUnidadMedida(unit);
            
            // Buscar la categoría del producto en la lista cargada
            const catEncontrada = cats.find(c => c.nombre === prod.nombreCategoria);
            if (catEncontrada) {
                setIdCategoria(catEncontrada.id.toString());
            }

            // Cargar galería estructurada
            if (prod.galeria) {
                setGaleriaActual(prod.galeria);
            } else {
                // Fallback por si la respuesta no la trae estructurada
                setGaleriaActual(prod.galeriaUrls.map((url, index) => ({ id: index, url, tipo: 'imagen' })));
            }
        } catch (err: any) {
            console.error(err);
            setError("No se pudo cargar la información del producto.");
        } finally {
            setBuscando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    // 3. Modificar datos de texto y categoría (JSON PUT)
    const handleGuardarDatosTexto = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        if (!nombre.trim() || !precio.trim() || !idCategoria || !id || !usuario) return;

        setCargando(true);
        try {
            await ComercianteService.editarProducto(
                usuario.id,
                parseInt(id),
                nombre,
                descripcion,
                parseFloat(precio),
                parseInt(idCategoria),
                unidadMedida,
                marca
            );
            alert("¡Producto y categoría actualizados correctamente (Auditado)!");
            navigate('/panel/mercaderia');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al actualizar los datos del producto.");
        } finally {
            setCargando(false);
        }
    };

    // 4. Subir nuevos archivos multimedia
    const handleSubirArchivos = async () => {
        setError("");
        setMensaje("");

        if (archivosNuevos.length === 0 || !id || !usuario) {
            setError("Selecciona al menos un archivo para subir.");
            return;
        }

        if (galeriaActual.length + archivosNuevos.length > 5) {
            setError(`Límite excedido. Un producto puede tener máximo 5 archivos multimedia (Tienes ${galeriaActual.length} cargados).`);
            return;
        }

        // Validar tamaño máximo de archivos (Max 5MB)
        const limiteSize = 5 * 1024 * 1024;
        for (const archivo of archivosNuevos) {
            if (archivo.size > limiteSize) {
                setError(`El archivo ${archivo.name} supera los 5MB permitidos.`);
                return;
            }
        }

        setCargandoMultimedia(true);
        try {
            const nuevaGaleria = await ComercianteService.subirMultimedia(usuario.id, parseInt(id), archivosNuevos);
            setMensaje("Archivos cargados con éxito.");
            setArchivosNuevos([]);
            setGaleriaActual(nuevaGaleria);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al subir imágenes.");
        } finally {
            setCargandoMultimedia(false);
        }
    };

    // 5. Eliminar foto granular
    const handleEliminarFoto = async (idMultimedia: number) => {
        const confirmar = window.confirm("¿Está seguro de eliminar esta imagen de la galería?");
        if (!confirmar) return;

        setError("");
        setMensaje("");
        setCargandoMultimedia(true);
        try {
            const nuevaGaleria = await ComercianteService.eliminarMultimedia(usuario!.id, parseInt(id!), idMultimedia);
            setMensaje("Imagen eliminada de la galería.");
            setGaleriaActual(nuevaGaleria);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al eliminar la imagen.");
        } finally {
            setCargandoMultimedia(false);
        }
    };

    if (!usuario || !esComerciante) return null;

    return (
        <div style={{ maxWidth: '650px', width: '100%', margin: '0 auto', textAlign: 'left', padding: '0 16px 40px 16px', boxSizing: 'border-box' }}>
            <Link to="/panel/mercaderia" style={{ display: 'inline-block', marginBottom: '16px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                ← Volver al Catálogo
            </Link>
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
                        Modifica los datos del producto seleccionado de forma independiente a sus fotos de catálogo.
                    </p>

                    {mensaje && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            fontWeight: 500
                        }}>
                            {mensaje}
                        </div>
                    )}

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Sección 1: Información textual y Categoría */}
                            <form id="edit-product-form" onSubmit={handleGuardarDatosTexto} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-marca" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        Marca (Ej. Mairaneño, Sofía o Casero)
                                    </label>
                                    <input
                                        id="edit-marca"
                                        type="text"
                                        value={marca}
                                        onChange={e => setMarca(e.target.value)}
                                        placeholder="Ej. Casero"
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-descripcion" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        Descripción (Opcional)
                                    </label>
                                    <textarea
                                        id="edit-descripcion"
                                        placeholder="Describa los detalles, frescura o presentación del producto..."
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            background: '#ffffff',
                                            color: 'var(--text-primary)',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="edit-unidad" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                            Unidad de Medida *
                                        </label>
                                        <select
                                            id="edit-unidad"
                                            value={unidadMedida}
                                            onChange={e => setUnidadMedida(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box', background: '#ffffff' }}
                                        >
                                            {unidadesMaestras.map(u => (
                                                <option key={u.id} value={u.codigo}>{u.nombre} ({u.codigo})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label htmlFor="edit-categoria" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                        Categoría *
                                    </label>
                                    <select
                                        id="edit-categoria"
                                        value={idCategoria}
                                        onChange={e => setIdCategoria(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box', background: '#ffffff' }}
                                    >
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </form>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                            {/* Sección 2: CRUD de Galería Multimedia */}
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 8px 0' }}>
                                    Galería Multimedia (Máx. 5 fotos)
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                                    La primera imagen listada en la galería es la que se mostrará como portada principal en el catálogo.
                                </p>

                                {/* Listado de multimedia actual */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                                    gap: '12px',
                                    marginBottom: '20px'
                                }}>
                                    {galeriaActual.map((item) => (
                                        <div key={item.id} style={{
                                            position: 'relative',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            height: '110px',
                                            overflow: 'hidden',
                                            background: '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {item.tipo === 'video' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                    </svg>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Video</span>
                                                </div>
                                            ) : (
                                                <img src={`http://localhost:8080${item.url}`} alt="Multimedia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}

                                            {/* Botón rojo de borrar individual */}
                                            <button
                                                type="button"
                                                onClick={() => handleEliminarFoto(item.id)}
                                                disabled={cargandoMultimedia}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: '#ef4444',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    boxShadow: 'var(--shadow-sm)'
                                                }}
                                                title="Eliminar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {galeriaActual.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                                            No hay imágenes registradas para este producto
                                        </div>
                                    )}
                                </div>

                                {/* Formulario para subir nuevas imágenes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        Subir nuevos archivos (Fotos / Videos)
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/mp4"
                                            onChange={e => setArchivosNuevos(e.target.files ? Array.from(e.target.files) : [])}
                                            style={{ fontSize: '0.85rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSubirArchivos}
                                            disabled={cargandoMultimedia || archivosNuevos.length === 0}
                                            style={{
                                                background: 'var(--secondary)',
                                                color: '#ffffff',
                                                padding: '8px 16px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                cursor: (cargandoMultimedia || archivosNuevos.length === 0) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {cargandoMultimedia ? 'Subiendo...' : 'Subir Archivos'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="edit-product-form"
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
                                    width: '100%',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'background var(--transition-speed)',
                                    marginTop: '32px'
                                }}
                                onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--primary-dark)'; }}
                                onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = 'var(--secondary)'; }}
                            >
                                {cargando ? 'Guardando Cambios...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };
