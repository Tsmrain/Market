import React, { useEffect, useState } from 'react';

export const GestionAsociaciones: React.FC = () => {
    const [asociaciones, setAsociaciones] = useState<any[]>([]);

    // Form State for Asociacion
    const [nombre, setNombre] = useState("");
    const [editId, setEditId] = useState<number | null>(null);

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarAsociaciones = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/superadmin/asociaciones');
            if (res.ok) {
                const data = await res.json();
                setAsociaciones(data);
            } else {
                setError("No se pudo cargar la lista de asociaciones.");
            }
        } catch (err) {
            setError("Error de conexión al cargar asociaciones.");
        }
    };

    useEffect(() => {
        cargarAsociaciones();
    }, []);

    const handleAsociacionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }

        setCargando(true);
        try {
            const url = editId 
                ? `http://localhost:8080/api/superadmin/asociaciones/${editId}`
                : 'http://localhost:8080/api/superadmin/asociaciones';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });

            if (res.ok) {
                setMensaje(editId ? "Asociación actualizada exitosamente." : "Asociación creada exitosamente.");
                setNombre("");
                setEditId(null);
                cargarAsociaciones();
            } else {
                const data = await res.json();
                setError(data.error || "Ocurrió un error.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handleEliminar = async (id: number, nombreAsoc: string) => {
        const confirmacion = window.confirm(`¿Está seguro que desea eliminar la asociación "${nombreAsoc}"?`);
        if (!confirmacion) return;

        setMensaje("");
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/superadmin/asociaciones/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMensaje(`Asociación "${nombreAsoc}" eliminada.`);
                cargarAsociaciones();
            } else {
                setError("No se pudo eliminar la asociación.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
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
                {/* Left Side: Create/Edit Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                        <form onSubmit={handleAsociacionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                                {editId ? "Editar Asociación" : "Registrar Nueva Asociación"}
                            </h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre de la Asociación *</label>
                                <input type="text" placeholder="Ej. Asociación 16 de Julio" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                                    {editId ? "Guardar Cambios" : "Crear Asociación"}
                                </button>
                                {editId && (
                                    <button type="button" onClick={() => { setEditId(null); setNombre(""); }} style={{ background: '#f3f4f6', color: 'var(--text-secondary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Data Table */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                        Asociaciones Registradas
                    </h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '8px' }}>ID</th>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asociaciones.map((asoc: any) => (
                                    <tr key={asoc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px', color: 'var(--text-light)' }}>{asoc.id}</td>
                                        <td style={{ padding: '8px', fontWeight: 600 }}>{asoc.nombre}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => {
                                                    setEditId(asoc.id);
                                                    setNombre(asoc.nombre);
                                                }} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                                    Editar
                                                </button>
                                                <button onClick={() => handleEliminar(asoc.id, asoc.nombre)} style={{ color: '#ef4444', fontWeight: 700 }}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {asociaciones.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No hay asociaciones registradas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
