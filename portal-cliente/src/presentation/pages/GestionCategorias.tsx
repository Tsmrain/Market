import React, { useEffect, useState } from 'react';
import { AdminService } from '../../application/AdminService';
import { CatalogoService } from '../../application/CatalogoService';

export const GestionCategorias: React.FC = () => {
    // Category list state
    const [categorias, setCategorias] = useState<any[]>([]);

    // Category Form State
    const [nombreCat, setNombreCat] = useState("");
    const [idCategoriaPadre, setIdCategoriaPadre] = useState("");

    // Editing State (Modals/Inline Edit)
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
    const [editCategoryNombre, setEditCategoryNombre] = useState("");

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarCategorias = async () => {
        try {
            const data = await CatalogoService.obtenerTodasLasCategorias();
            setCategorias(data);
        } catch (err) {
            setError("No se pudo cargar la lista de categorías.");
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    // Crear categoría submit
    const handleCrearCategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!nombreCat.trim()) {
            setError("El nombre de la categoría es obligatorio.");
            return;
        }

        setCargando(true);
        try {
            await AdminService.crearCategoria(nombreCat, idCategoriaPadre || undefined);
            setMensaje(`Categoría '${nombreCat}' creada exitosamente.`);
            setNombreCat("");
            setIdCategoriaPadre("");
            cargarCategorias();
        } catch (err: any) {
            setError(err.message || "Error al crear la categoría.");
        } finally {
            setCargando(false);
        }
    };

    // Editar categoría submit
    const handleEditCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!editCategoryNombre.trim() || !editCategoryId) return;

        setCargando(true);
        try {
            await AdminService.editarCategoria(editCategoryId, editCategoryNombre);
            setMensaje("Categoría actualizada.");
            setEditCategoryId(null);
            cargarCategorias();
        } catch (err: any) {
            setError(err.message || "Error al actualizar la categoría.");
        } finally {
            setCargando(false);
        }
    };

    // Eliminar categoría (Soft Delete)
    const handleEliminarCategoria = async (id: number, nombreCat: string) => {
        const confirmacion = window.confirm(`¿Está seguro de eliminar la categoría "${nombreCat}" de forma lógica?`);
        if (!confirmacion) return;

        setMensaje("");
        setError("");
        try {
            await AdminService.eliminarCategoria(id);
            setMensaje(`Categoría "${nombreCat}" eliminada lógicamente.`);
            cargarCategorias();
        } catch (err: any) {
            setError(err.message || "Error al eliminar la categoría.");
        }
    };

    return (
        <div>
            {mensaje && (
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 500 }}>
                    {mensaje}
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 500 }}>
                    {error}
                </div>
            )}

            <div className="split-grid">
                {/* Left Form: Create or Edit */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    {editCategoryId ? (
                        <form onSubmit={handleEditCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Editar Categoría</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre *</label>
                                <input type="text" value={editCategoryNombre} onChange={e => setEditCategoryNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Guardar</button>
                                <button type="button" onClick={() => setEditCategoryId(null)} style={{ background: '#f3f4f6', color: 'var(--text-secondary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleCrearCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Crear Categoría</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre *</label>
                                <input type="text" placeholder="Ej. Lacteos" value={nombreCat} onChange={e => setNombreCat(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Categoría Padre (Opcional)</label>
                                <select value={idCategoriaPadre} onChange={e => setIdCategoriaPadre(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff' }}>
                                    <option value="">-- Ninguna (Categoría Raíz) --</option>
                                    {categorias.filter(c => !c.idCategoriaPadre).map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Crear</button>
                        </form>
                    )}
                </div>

                {/* Right Side: Data Table */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                        Listado de Categorías
                    </h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>Categoría Padre</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((cat: any) => {
                                    const padre = categorias.find(c => c.id === cat.idCategoriaPadre);
                                    return (
                                        <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{cat.nombre}</td>
                                            <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{padre ? padre.nombre : 'Raíz'}</td>
                                            <td style={{ padding: '8px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => {
                                                    setEditCategoryId(cat.id);
                                                    setEditCategoryNombre(cat.nombre);
                                                }} style={{ color: 'var(--primary)', fontWeight: 700 }}>Editar</button>
                                                <button onClick={() => handleEliminarCategoria(cat.id, cat.nombre)} style={{ color: '#ef4444', fontWeight: 700 }}>Eliminar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
