import React, { useEffect, useState } from 'react';
import { SuperAdminService } from '../../application/SuperAdminService';

export const GestionAdministradores: React.FC = () => {
    // CRUD state for administrators
    const [admins, setAdmins] = useState<any[]>([]);

    // Form State
    const [ci, setCi] = useState("");
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");

    // Editing State
    const [editAdminId, setEditAdminId] = useState<number | null>(null);
    const [editAdminNombre, setEditAdminNombre] = useState("");
    const [editAdminPin, setEditAdminPin] = useState("");
    const [editAdminCi, setEditAdminCi] = useState("");
    const [editAdminTelefono, setEditAdminTelefono] = useState("");

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarAdministradores = async () => {
        try {
            const adminsData = await SuperAdminService.listarAdministradores();
            setAdmins(adminsData);
        } catch (err) {
            setError("No se pudo cargar la lista de administradores.");
        }
    };

    useEffect(() => {
        cargarAdministradores();
    }, []);

    // Register admin submit
    const handleRegisterAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!ci.trim() || !pin.trim() || !nombre.trim() || !telefono.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (pin.length !== 4) {
            setError("El PIN debe tener exactamente 4 dígitos.");
            return;
        }

        setCargando(true);
        try {
            await SuperAdminService.crearAdministrador(ci, pin, nombre, telefono);
            setMensaje("Administrador de mercado registrado exitosamente.");
            setCi("");
            setPin("");
            setNombre("");
            setTelefono("");
            cargarAdministradores();
        } catch (err: any) {
            setError(err.message || "Error al registrar al administrador.");
        } finally {
            setCargando(false);
        }
    };

    // Edit admin submit
    const handleEditAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!editAdminNombre.trim() || !editAdminId || !editAdminTelefono.trim()) {
            setError("El nombre y teléfono son obligatorios.");
            return;
        }

        if (editAdminPin && editAdminPin.length !== 4) {
            setError("El PIN nuevo debe tener exactamente 4 dígitos.");
            return;
        }

        setCargando(true);
        try {
            await SuperAdminService.editarAdministrador(
                editAdminId,
                editAdminNombre,
                editAdminPin ? editAdminPin : undefined,
                editAdminTelefono
            );
            setMensaje("Administrador actualizado exitosamente.");
            setEditAdminId(null);
            setEditAdminPin("");
            setEditAdminTelefono("");
            cargarAdministradores();
        } catch (err: any) {
            setError(err.message || "Error al actualizar al administrador.");
        } finally {
            setCargando(false);
        }
    };

    // Logical delete admin
    const handleEliminarAdmin = async (id: number, nombreAdm: string) => {
        const confirmacion = window.confirm(`¿Está seguro que desea dar de baja al administrador "${nombreAdm}"?`);
        if (!confirmacion) return;

        setMensaje("");
        setError("");
        try {
            await SuperAdminService.eliminarAdministrador(id);
            setMensaje(`Administrador "${nombreAdm}" dado de baja.`);
            cargarAdministradores();
        } catch (err: any) {
            setError(err.message || "Error al eliminar al administrador.");
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

            {/* CRUD Grid Layout */}
            <div className="split-grid">
                {/* Left Form */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    {editAdminId ? (
                        <form onSubmit={handleEditAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Editar Administrador</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>CI (Inmutable)</label>
                                <input type="text" value={editAdminCi} disabled style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre completo *</label>
                                <input type="text" value={editAdminNombre} onChange={e => setEditAdminNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono *</label>
                                <input type="text" value={editAdminTelefono} onChange={e => setEditAdminTelefono(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Cambiar PIN (Opcional, 4 dígitos)</label>
                                <input type="password" maxLength={4} placeholder="••••" value={editAdminPin} onChange={e => setEditAdminPin(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', letterSpacing: '0.1em' }} />
                             </div>
                             <div style={{ display: 'flex', gap: '8px' }}>
                                 <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Guardar</button>
                                 <button type="button" onClick={() => setEditAdminId(null)} style={{ background: '#f3f4f6', color: 'var(--text-secondary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
                             </div>
                         </form>
                     ) : (
                         <form onSubmit={handleRegisterAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                             <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Registrar Administrador de Mercado</h3>
                             <div>
                                 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre Completo *</label>
                                 <input type="text" placeholder="Ej. Roberto Gomez" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                             </div>
                             <div>
                                 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Carnet de Identidad (CI) *</label>
                                 <input type="text" placeholder="Ej. 9876543" value={ci} onChange={e => setCi(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                             </div>
                             <div>
                                 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono *</label>
                                 <input type="text" placeholder="Ej. 71234567" value={telefono} onChange={e => setTelefono(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                             </div>
                             <div>
                                 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>PIN Inicial (4 dígitos) *</label>
                                 <input type="password" maxLength={4} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', letterSpacing: '0.1em' }} />
                             </div>
                                 <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Registrar</button>
                        </form>
                    )}
                </div>

                {/* Right Side: Data Table */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                        Administradores de Mercado Registrados
                    </h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '8px' }}>Nombre</th>
                                        <th style={{ padding: '8px' }}>CI</th>
                                        <th style={{ padding: '8px' }}>Teléfono</th>
                                        <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((adm: any) => (
                                        <tr key={adm.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{adm.nombre}</td>
                                            <td style={{ padding: '8px' }}>{adm.ci}</td>
                                            <td style={{ padding: '8px' }}>{adm.telefono || '---'}</td>
                                            <td style={{ padding: '8px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => {
                                                    setEditAdminId(adm.id);
                                                    setEditAdminNombre(adm.nombre);
                                                    setEditAdminCi(adm.ci);
                                                    setEditAdminTelefono(adm.telefono || "");
                                                    setEditAdminPin("");
                                                }} style={{ color: 'var(--primary)', fontWeight: 700 }}>Editar</button>
                                                <button onClick={() => handleEliminarAdmin(adm.id, adm.nombre)} style={{ color: '#ef4444', fontWeight: 700 }}>Dar de Baja</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                No hay administradores de mercado registrados.
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
