import React, { useEffect, useState } from 'react';
import { AdminService } from '../../application/AdminService';

export const GestionComerciantes: React.FC = () => {
    // Merchant list state
    const [comerciantes, setComerciantes] = useState<any[]>([]);

    // Merchant Form State
    const [ci, setCi] = useState("");
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");

    // Editing State (Modals/Inline Edit)
    const [editMerchantId, setEditMerchantId] = useState<number | null>(null);
    const [editMerchantNombre, setEditMerchantNombre] = useState("");
    const [editMerchantTelefono, setEditMerchantTelefono] = useState("");
    const [editMerchantPin, setEditMerchantPin] = useState("");
    const [editMerchantCi, setEditMerchantCi] = useState("");

    // UI state
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const cargarComerciantes = async () => {
        try {
            const data = await AdminService.listarComerciantes();
            setComerciantes(data);
        } catch (err) {
            setError("No se pudo cargar la lista de comerciantes.");
        }
    };

    useEffect(() => {
        cargarComerciantes();
    }, []);

    // Registrar comerciante
    const handleRegisterComerciante = async (e: React.FormEvent) => {
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

        if (!/^[67]\d{7}$/.test(telefono)) {
            setError("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
            return;
        }

        setCargando(true);
        try {
            const response = await fetch('http://localhost:8080/api/admin/comerciantes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ci, pin, nombre, telefono })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar al comerciante.');
            }

            setMensaje(data.mensaje || "Comerciante registrado exitosamente.");
            setCi("");
            setPin("");
            setNombre("");
            setTelefono("");
            cargarComerciantes();
        } catch (err: any) {
            setError(err.message || "Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    // Editar comerciante submit
    const handleEditMerchantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!editMerchantNombre.trim() || !editMerchantTelefono.trim() || !editMerchantId) {
            setError("Nombre y celular son requeridos.");
            return;
        }

        if (!/^[67]\d{7}$/.test(editMerchantTelefono)) {
            setError("El número de celular debe tener exactamente 8 dígitos y comenzar con 6 o 7.");
            return;
        }

        if (editMerchantPin && editMerchantPin.length !== 4) {
            setError("El PIN nuevo debe tener exactamente 4 dígitos.");
            return;
        }

        setCargando(true);
        try {
            await AdminService.editarComerciante(
                editMerchantId,
                editMerchantNombre,
                editMerchantTelefono,
                editMerchantPin ? editMerchantPin : undefined
            );
            setMensaje("Comerciante actualizado exitosamente.");
            setEditMerchantId(null);
            setEditMerchantPin("");
            cargarComerciantes();
        } catch (err: any) {
            setError(err.message || "Error al actualizar comerciante.");
        } finally {
            setCargando(false);
        }
    };

    // Dar de baja comerciante
    const handleDarDeBajaComerciante = async (id: number, nombreCom: string) => {
        const confirmacion = window.confirm(
            `⚠️ ADVERTENCIA CRÍTICA:\n¿Está seguro que desea dar de baja al comerciante "${nombreCom}"?\nAl hacerlo, este comerciante y TODOS sus productos desaparecerán permanentemente del catálogo público (borrado lógico en cascada).`
        );
        if (!confirmacion) return;

        setMensaje("");
        setError("");
        try {
            await AdminService.darDeBajaComerciante(id);
            setMensaje(`Comerciante "${nombreCom}" dado de baja exitosamente.`);
            cargarComerciantes();
        } catch (err: any) {
            setError(err.message || "Error al dar de baja al comerciante.");
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
                    {editMerchantId ? (
                        <form onSubmit={handleEditMerchantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Editar Comerciante</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>CI (Inmutable)</label>
                                <input type="text" value={editMerchantCi} disabled style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre completo *</label>
                                <input type="text" value={editMerchantNombre} onChange={e => setEditMerchantNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono celular *</label>
                                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <span style={{ padding: '8px 10px', background: '#f3f4f6', fontSize: '0.85rem', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>+591</span>
                                    <input type="tel" maxLength={8} value={editMerchantTelefono} onChange={e => setEditMerchantTelefono(e.target.value.replace(/\D/g, ''))} required style={{ flexGrow: 1, padding: '8px 10px', border: 'none', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Cambiar PIN (Opcional, 4 dígitos)</label>
                                <input type="password" maxLength={4} placeholder="••••" value={editMerchantPin} onChange={e => setEditMerchantPin(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', letterSpacing: '0.1em' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Guardar</button>
                                <button type="button" onClick={() => setEditMerchantId(null)} style={{ background: '#f3f4f6', color: 'var(--text-secondary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterComerciante} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Registrar Comerciante</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nombre Completo *</label>
                                <input type="text" placeholder="Ej. Juan Perez" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Carnet de Identidad (CI) *</label>
                                <input type="text" placeholder="Ej. 1234567" value={ci} onChange={e => setCi(e.target.value)} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>PIN Inicial (4 dígitos) *</label>
                                <input type="password" maxLength={4} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', letterSpacing: '0.1em' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Teléfono Celular *</label>
                                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <span style={{ padding: '8px 10px', background: '#f3f4f6', fontSize: '0.85rem', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>+591</span>
                                    <input type="tel" maxLength={8} placeholder="Ej. 71234567" value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))} required style={{ flexGrow: 1, padding: '8px 10px', border: 'none', outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" disabled={cargando} style={{ background: 'var(--secondary)', color: '#ffffff', padding: '10px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>Registrar</button>
                        </form>
                    )}
                </div>

                {/* Right Side: Data Table */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                        Listado de Comerciantes
                    </h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>CI</th>
                                    <th style={{ padding: '8px' }}>Celular</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comerciantes.map((com: any) => (
                                    <tr key={com.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px', fontWeight: 600 }}>{com.nombre}</td>
                                        <td style={{ padding: '8px' }}>{com.ci}</td>
                                        <td style={{ padding: '8px' }}>+591 {com.telefono}</td>
                                        <td style={{ padding: '8px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => {
                                                setEditMerchantId(com.id);
                                                setEditMerchantNombre(com.nombre);
                                                setEditMerchantTelefono(com.telefono);
                                                setEditMerchantCi(com.ci);
                                                setEditMerchantPin("");
                                            }} style={{ color: 'var(--primary)', fontWeight: 700 }}>Editar</button>
                                            <button onClick={() => handleDarDeBajaComerciante(com.id, com.nombre)} style={{ color: '#ef4444', fontWeight: 700 }}>Dar de Baja</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
