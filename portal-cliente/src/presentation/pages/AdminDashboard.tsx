import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../application/useAuthController';
import { CatalogoService } from '../../application/CatalogoService';

export const AdminDashboard: React.FC = () => {
    const { logout } = useAuthController();
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState<'comerciantes' | 'categorias'>('comerciantes');

    // Merchant list state
    const [comerciantes, setComerciantes] = useState<any[]>([]);
    
    // Category list state
    const [categorias, setCategorias] = useState<any[]>([]);

    // Merchant Form State
    const [ci, setCi] = useState("");
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");

    // Category Form State
    const [nombreCat, setNombreCat] = useState("");
    const [idCategoriaPadre, setIdCategoriaPadre] = useState("");

    // Editing State (Modals/Inline Edit)
    const [editMerchantId, setEditMerchantId] = useState<number | null>(null);
    const [editMerchantNombre, setEditMerchantNombre] = useState("");
    const [editMerchantTelefono, setEditMerchantTelefono] = useState("");
    const [editMerchantPin, setEditMerchantPin] = useState("");
    const [editMerchantCi, setEditMerchantCi] = useState("");

    const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
    const [editCategoryNombre, setEditCategoryNombre] = useState("");

    // Shared UI State
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    // Fetch initial data
    const cargarDatos = async () => {
        try {
            if (activeTab === 'comerciantes') {
                const data = await CatalogoService.listarComerciantes();
                setComerciantes(data);
            } else {
                const data = await CatalogoService.obtenerTodasLasCategorias();
                setCategorias(data);
            }
        } catch (err: any) {
            console.error("Error cargando datos:", err);
            setError("No se pudo cargar la información del panel.");
        }
    };

    useEffect(() => {
        setMensaje("");
        setError("");
        cargarDatos();
    }, [activeTab]);

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
            cargarDatos();
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
            await CatalogoService.editarComerciante(
                editMerchantId,
                editMerchantNombre,
                editMerchantTelefono,
                editMerchantPin ? editMerchantPin : undefined
            );
            setMensaje("Comerciante actualizado exitosamente.");
            setEditMerchantId(null);
            setEditMerchantPin("");
            cargarDatos();
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
            await CatalogoService.darDeBajaComerciante(id);
            setMensaje(`Comerciante "${nombreCom}" dado de baja exitosamente.`);
            cargarDatos();
        } catch (err: any) {
            setError(err.message || "Error al dar de baja al comerciante.");
        }
    };

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
            await CatalogoService.crearCategoria(nombreCat, idCategoriaPadre || undefined);
            setMensaje(`Categoría '${nombreCat}' creada exitosamente.`);
            setNombreCat("");
            setIdCategoriaPadre("");
            cargarDatos();
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
            await CatalogoService.editarCategoria(editCategoryId, editCategoryNombre);
            setMensaje("Categoría actualizada.");
            setEditCategoryId(null);
            cargarDatos();
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
            await CatalogoService.eliminarCategoria(id);
            setMensaje(`Categoría "${nombreCat}" eliminada lógicamente.`);
            cargarDatos();
        } catch (err: any) {
            setError(err.message || "Error al eliminar la categoría.");
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header Administrativo */}
            <header style={{
                background: 'var(--primary-dark)',
                color: '#ffffff',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Portal Administrativo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                        Ir al Portal Público →
                    </Link>
                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Layout Principal */}
            <main className="fluid-container" style={{ flexGrow: 1 }}>
                {/* Tabs Selectors */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '24px',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => { setActiveTab('comerciantes'); setMensaje(""); setError(""); setEditMerchantId(null); setEditCategoryId(null); }}
                        style={{
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: activeTab === 'comerciantes' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'comerciantes' ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none',
                            outline: 'none'
                        }}
                    >
                        Comerciantes
                    </button>
                    <button
                        onClick={() => { setActiveTab('categorias'); setMensaje(""); setError(""); setEditMerchantId(null); setEditCategoryId(null); }}
                        style={{
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: activeTab === 'categorias' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'categorias' ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none',
                            outline: 'none'
                        }}
                    >
                        Categorías
                    </button>
                </div>

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
                        {activeTab === 'comerciantes' ? (
                            editMerchantId ? (
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
                            )
                        ) : (
                            editCategoryId ? (
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
                            )
                        )}
                    </div>

                    {/* Right Side: Data Table */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                            {activeTab === 'comerciantes' ? 'Listado de Comerciantes' : 'Listado de Categorías'}
                        </h3>
                        <div className="table-responsive">
                            {activeTab === 'comerciantes' ? (
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
                            ) : (
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
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
