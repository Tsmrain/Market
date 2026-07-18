import React, { useEffect, useState } from 'react';
import { PasswordInput } from '../components/PasswordInput';

export const GestionAdministradores: React.FC = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [asociaciones, setAsociaciones] = useState<any[]>([]);

    // Form State
    const [ci, setCi] = useState("");
    const [expedido, setExpedido] = useState("SC");
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [asociacionId, setAsociacionId] = useState("");

    // Editing State
    const [editId, setEditId] = useState<number | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editPin, setEditPin] = useState("");
    const [editTelefono, setEditTelefono] = useState("");
    const [editAsociacionId, setEditAsociacionId] = useState("");

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        try {
            // Cargar administradores
            const resAdmins = await fetch('http://localhost:8080/api/superadmin/administradores');
            if (resAdmins.ok) {
                const data = await resAdmins.json();
                setAdmins(data);
            }
            
            // Cargar asociaciones
            const resAsocs = await fetch('http://localhost:8080/api/superadmin/asociaciones');
            if (resAsocs.ok) {
                const data = await resAsocs.json();
                setAsociaciones(data);
            }
        } catch (err) {
            setError("Error al cargar los datos del servidor.");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!ci.trim() || !pin.trim() || !nombre.trim() || !telefono.trim() || !asociacionId) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setCargando(true);
        try {
            const res = await fetch('http://localhost:8080/api/superadmin/administradores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ci,
                    expedido,
                    pin, // Maps to password
                    nombre,
                    telefono,
                    asociacionId
                })
            });

            if (res.ok) {
                setMensaje("Administrador de asociación registrado con éxito.");
                setCi("");
                setPin("");
                setNombre("");
                setTelefono("");
                setAsociacionId("");
                cargarDatos();
            } else {
                const data = await res.json();
                setError(data.error || "Ocurrió un error al registrar.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!editNombre.trim() || !editTelefono.trim() || !editAsociacionId) {
            setError("El nombre, teléfono y asociación son obligatorios.");
            return;
        }

        setCargando(true);
        try {
            const res = await fetch(`http://localhost:8080/api/superadmin/administradores/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: editNombre,
                    pin: editPin ? editPin : undefined,
                    telefono: editTelefono,
                    asociacionId: editAsociacionId
                })
            });

            if (res.ok) {
                setMensaje("Administrador actualizado correctamente.");
                setEditId(null);
                setEditNombre("");
                setEditPin("");
                setEditTelefono("");
                setEditAsociacionId("");
                cargarDatos();
            } else {
                const data = await res.json();
                setError(data.error || "Ocurrió un error al actualizar.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handleEliminar = async (id: number, nombreAdm: string) => {
        const confirmacion = window.confirm(`¿Está seguro que desea dar de baja al administrador "${nombreAdm}"?`);
        if (!confirmacion) return;

        setMensaje("");
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/superadmin/administradores/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMensaje(`Administrador "${nombreAdm}" dado de baja.`);
                cargarDatos();
            } else {
                setError("No se pudo eliminar al administrador.");
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
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    {editId ? (
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Editar Administrador</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre completo *</label>
                                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono *</label>
                                <input type="text" value={editTelefono} onChange={e => setEditTelefono(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Asociación *</label>
                                <select value={editAsociacionId} onChange={e => setEditAsociacionId(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--card-bg)' }}>
                                    <option value="">Seleccione una asociación...</option>
                                    {asociaciones.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Cambiar Contraseña (Opcional)</label>
                                <PasswordInput placeholder="Nueva contraseña" value={editPin} onChange={e => setEditPin(e.target.value)} style={{ padding: '8px 40px 8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Guardar</button>
                                <button type="button" onClick={() => setEditId(null)} style={{ background: '#f3f4f6', color: 'var(--text-secondary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Registrar Administrador de Asociación</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre completo *</label>
                                <input type="text" placeholder="Ej. Roberto Gómez" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Carnet de Identidad (CI) *</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" placeholder="Ej. 1234567" value={ci} onChange={e => setCi(e.target.value)} required style={{ flexGrow: 1, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                                    <select value={expedido} onChange={e => setExpedido(e.target.value)} required style={{ padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--card-bg)' }}>
                                        <option value="SC">SC</option>
                                        <option value="LP">LP</option>
                                        <option value="CB">CB</option>
                                        <option value="OR">OR</option>
                                        <option value="PT">PT</option>
                                        <option value="TJ">TJ</option>
                                        <option value="CH">CH</option>
                                        <option value="BE">BE</option>
                                        <option value="PD">PD</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono *</label>
                                <input type="text" placeholder="Ej. 77712345" value={telefono} onChange={e => setTelefono(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Asociación *</label>
                                <select value={asociacionId} onChange={e => setAsociacionId(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--card-bg)' }}>
                                    <option value="">Seleccione una asociación...</option>
                                    {asociaciones.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Contraseña de Acceso *</label>
                                <PasswordInput placeholder="Contraseña de ingreso" value={pin} onChange={e => setPin(e.target.value)} required style={{ padding: '8px 40px 8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Registrar</button>
                        </form>
                    )}
                </div>

                {/* Right Side: Data Table */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                        Dirigentes y Asociaciones que Presiden
                    </h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>CI</th>
                                    <th style={{ padding: '8px' }}>Teléfono</th>
                                    <th style={{ padding: '8px' }}>Asociación Asignada</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((adm: any) => (
                                    <tr key={adm.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px', fontWeight: 600 }}>{adm.nombre}</td>
                                        <td style={{ padding: '8px' }}>{adm.ci} {adm.expedido || ''}</td>
                                        <td style={{ padding: '8px' }}>{adm.telefono || '---'}</td>
                                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--primary)' }}>
                                            {adm.asociacionNombre || 'Ninguna'}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => {
                                                    setEditId(adm.id);
                                                    setEditNombre(adm.nombre);
                                                    setEditTelefono(adm.telefono || "");
                                                    setEditAsociacionId(adm.asociacionId ? adm.asociacionId.toString() : "");
                                                    setEditPin("");
                                                }} style={{ color: 'var(--primary)', fontWeight: 700 }}>Editar</button>
                                                <button onClick={() => handleEliminar(adm.id, adm.nombre)} style={{ color: '#ef4444', fontWeight: 700 }}>Dar de Baja</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No hay administradores de asociación registrados.
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
