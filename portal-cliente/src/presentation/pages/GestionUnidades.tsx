import React, { useEffect, useState } from 'react';
import { SuperAdminService } from '../../application/SuperAdminService';

export const GestionUnidades: React.FC = () => {
    // CRUD state for units
    const [unidades, setUnidades] = useState<any[]>([]);

    // Form State (New Unit)
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [admiteDecimales, setAdmiteDecimales] = useState(false);

    // Editing State
    const [editId, setEditId] = useState<number | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editAdmiteDecimales, setEditAdmiteDecimales] = useState(false);
    const [editCodigo, setEditCodigo] = useState("");

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarUnidades = async () => {
        try {
            const data = await SuperAdminService.listarUnidades();
            setUnidades(data);
        } catch (err) {
            setError("No se pudo cargar la lista de unidades de medida.");
        }
    };

    useEffect(() => {
        cargarUnidades();
    }, []);

    // Create unit submit
    const handleCreateUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!codigo.trim() || !nombre.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setCargando(true);
        try {
            await SuperAdminService.crearUnidad(codigo, nombre, admiteDecimales);
            setMensaje("Unidad de medida creada exitosamente.");
            setCodigo("");
            setNombre("");
            setAdmiteDecimales(false);
            cargarUnidades();
        } catch (err: any) {
            setError(err.message || "Error al crear la unidad de medida.");
        } finally {
            setCargando(false);
        }
    };

    // Edit unit submit
    const handleEditUnitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!editNombre.trim() || !editId) {
            setError("El nombre es obligatorio.");
            return;
        }

        setCargando(true);
        try {
            await SuperAdminService.editarUnidad(editId, editNombre, editAdmiteDecimales);
            setMensaje("Unidad de medida actualizada exitosamente.");
            setEditId(null);
            cargarUnidades();
        } catch (err: any) {
            setError(err.message || "Error al actualizar la unidad de medida.");
        } finally {
            setCargando(false);
        }
    };

    // Delete unit
    const handleDeleteUnit = async (id: number) => {
        const confirmar = window.confirm("¿Está seguro de eliminar esta unidad de medida? Esto puede afectar a los productos asociados.");
        if (!confirmar) return;

        setMensaje("");
        setError("");
        setCargando(true);
        try {
            await SuperAdminService.eliminarUnidad(id);
            setMensaje("Unidad de medida eliminada correctamente.");
            cargarUnidades();
        } catch (err: any) {
            setError(err.message || "Error al eliminar la unidad de medida.");
        } finally {
            setCargando(false);
        }
    };

    // Start editing
    const handleStartEdit = (unit: any) => {
        setEditId(unit.id);
        setEditCodigo(unit.codigo);
        setEditNombre(unit.nombre);
        setEditAdmiteDecimales(unit.admiteDecimales);
    };

    return (
        <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Gobernanza de Datos Maestros: Unidades de Medida
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Administra y estandariza las unidades globales de medida. Configura si admiten ventas fraccionarias (decimales) o si son discretas (números enteros).
            </p>

            {mensaje && (
                <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {mensaje}
                </div>
            )}

            {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Formulario de Registro o Edición */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
                    {editId ? (
                        <form onSubmit={handleEditUnitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                                Editar Unidad: {editCodigo}
                            </h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Nombre Descriptivo *
                                </label>
                                <input
                                    type="text"
                                    value={editNombre}
                                    onChange={e => setEditNombre(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    id="edit-decimales"
                                    checked={editAdmiteDecimales}
                                    onChange={e => setEditAdmiteDecimales(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="edit-decimales" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    Admite Venta Fraccionaria (Decimales)
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    style={{ flexGrow: 1, background: 'var(--primary)', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Guardar Cambios
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditId(null)}
                                    style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateUnit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                                Registrar Nueva Unidad Maestra
                            </h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Código de la Unidad * (Ej. KG, RACIMO)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. KG"
                                    value={codigo}
                                    onChange={e => setCodigo(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Nombre Descriptivo * (Ej. Kilogramos, Racimo)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. Kilogramos"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    id="add-decimales"
                                    checked={admiteDecimales}
                                    onChange={e => setAdmiteDecimales(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="add-decimales" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    Admite Venta Fraccionaria (Decimales)
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={cargando}
                                style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}
                            >
                                Registrar Unidad Maestra
                            </button>
                        </form>
                    )}
                </div>

                {/* DataGrid - Tabla de Unidades registradas */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                        Listado de Unidades de Medida Registradas
                    </h3>

                    {unidades.length === 0 ? (
                        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            No hay unidades de medida registradas.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Código</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Nombre</th>
                                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Fraccionario</th>
                                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unidades.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {u.codigo}
                                            </td>
                                            <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                                                {u.nombre}
                                            </td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: u.admiteDecimales ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: u.admiteDecimales ? '#166534' : '#991b1b'
                                                }}>
                                                    {u.admiteDecimales ? "SÍ (1.5)" : "NO (Entero)"}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleStartEdit(u)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginRight: '12px' }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUnit(u.id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
