import React, { useEffect, useState } from 'react';
import { useAuthController } from '../../application/useAuthController';
import { AdminService } from '../../application/AdminService';

export const PanelRecaudacion: React.FC = () => {
    const { usuario } = useAuthController();
    const [mes, setMes] = useState<number>(() => new Date().getMonth() + 1);
    const [anio, setAnio] = useState<number>(() => new Date().getFullYear());
    const [comerciantes, setComerciantes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    // Modal state for selecting payment method
    const [pagoModal, setPagoModal] = useState<{ comercianteId: number; nombreCom: string } | null>(null);

    const cargarComerciantes = async () => {
        if (!usuario) return;
        setCargando(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/recaudacion/comerciantes?mes=${mes}&anio=${anio}&adminId=${usuario.id}`, {
                headers: {
                    'X-User-Id': usuario.id.toString()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setComerciantes(data);
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || "No se pudo cargar la lista de comerciantes.");
            }
        } catch (err) {
            setError("Error de conexión al cargar comerciantes.");
        } finally {
            setCargando(false);
        }
    };

    const refrescarSilencioso = async () => {
        if (!usuario) return;
        try {
            const res = await fetch(`http://localhost:8080/api/recaudacion/comerciantes?mes=${mes}&anio=${anio}&adminId=${usuario.id}`, {
                headers: {
                    'X-User-Id': usuario.id.toString()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setComerciantes(data);
            }
        } catch (err) {
            // ignore silent fetch errors
        }
    };

    useEffect(() => {
        cargarComerciantes();

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refrescarSilencioso();
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [mes, anio, usuario]);

    const handleRegistrarPago = async (comercianteId: number, nombreCom: string, metodoPago: string) => {
        setMensaje("");
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/recaudacion/pagar/${comercianteId}?mes=${mes}&anio=${anio}&monto=31.0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuario!.id.toString()
                },
                body: JSON.stringify({ metodoPago })
            });

            if (res.ok) {
                setMensaje(`Pago de 31 Bs (${metodoPago}) registrado exitosamente para el comerciante "${nombreCom}".`);
                cargarComerciantes();
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "No se pudo registrar el pago.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        }
    };

    const handleAnularPago = async (comercianteId: number, nombreCom: string) => {
        const motivo = window.prompt(`Confirmar Anulación para "${nombreCom}":\nPor favor, escribe la razón de la anulación (Obligatorio):`);
        if (motivo === null) return; // Cancelado por el usuario
        if (!motivo.trim()) {
            window.alert("Debes ingresar un motivo válido para proceder con la anulación.");
            return;
        }

        setMensaje("");
        setError("");
        try {
            await AdminService.anularPago(comercianteId, mes, anio, motivo.trim());
            setMensaje(`Pago de cuota anulado exitosamente para "${nombreCom}".`);
            cargarComerciantes();
        } catch (err: any) {
            setError(err.message || "Error al anular el pago.");
        }
    };

    const comerciantesFiltrados = comerciantes.filter((c: any) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        const nombreMatches = c.nombre?.toLowerCase().includes(q);
        const puestoMatches = c.numeroPuesto?.toLowerCase().includes(q);
        const ciMatches = c.ci?.toLowerCase().includes(q);
        return nombreMatches || puestoMatches || ciMatches;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header and filters card */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                        Factura del Sistema (Cobranzas)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Registra y anula las cuotas mensuales de los comerciantes pertenecientes a tu asociación.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mes</label>
                        <select value={mes} onChange={e => setMes(parseInt(e.target.value))} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                            <option value={1}>Enero</option>
                            <option value={2}>Febrero</option>
                            <option value={3}>Marzo</option>
                            <option value={4}>Abril</option>
                            <option value={5}>Mayo</option>
                            <option value={6}>Junio</option>
                            <option value={7}>Julio</option>
                            <option value={8}>Agosto</option>
                            <option value={9}>Septiembre</option>
                            <option value={10}>Octubre</option>
                            <option value={11}>Noviembre</option>
                            <option value={12}>Diciembre</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Año</label>
                        <select value={anio} onChange={e => setAnio(parseInt(e.target.value))} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                            <option value={2028}>2028</option>
                        </select>
                    </div>
                </div>
            </div>

            {mensaje && (
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                    {mensaje}
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                    {error}
                </div>
            )}

            {/* Merchant payments table */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                {/* Search Input - Evasión Heurística Chrome */}
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Buscar comerciante por nombre, número de puesto o CI..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        name="search_merchant_query"
                        id="search_merchant_query"
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: '#ffffff',
                            color: 'var(--text-primary)',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                    Estado de Comerciantes
                </h4>

                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '12px 8px' }}>Nombre</th>
                                <th style={{ padding: '12px 8px' }}>CI</th>
                                <th style={{ padding: '12px 8px' }}>Nro Puesto</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Estado de Factura</th>
                                <th style={{ padding: '12px 8px' }}>Siguiente Fecha de Pago</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Monto</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Cargando comerciantes y estados de pago...
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {comerciantesFiltrados.map((c: any) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.nombre}</td>
                                            <td style={{ padding: '12px 8px' }}>{c.ci}</td>
                                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>{c.numeroPuesto || '---'}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                {c.estadoPago === 'PAGADO' ? (
                                                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        PAGADO
                                                    </span>
                                                ) : (
                                                    <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        PENDIENTE
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                                                {c.proximaFechaPago || '---'}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>
                                                {c.monto.toFixed(2)} Bs.
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                {c.estadoPago === 'PENDIENTE' ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => setPagoModal({ comercianteId: c.id, nombreCom: c.nombre })}
                                                            style={{ background: 'var(--secondary)', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                                        >
                                                            Registrar Pago
                                                        </button>
                                                        <a
                                                            href={`https://wa.me/591${c.telefono}?text=${encodeURIComponent(`Hola ${c.nombre}, te recuerdo que debes pagar tu Factura del Sistema para poder seguir vendiendo en línea en el Mercado Mutualista.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                background: '#25d366',
                                                                color: '#ffffff',
                                                                padding: '6px 12px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                textDecoration: 'none',
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            Enviar Recordatorio
                                                        </a>
                                                    </div>
                                                ) : (
                                                    (() => {
                                                        const esEditable = (() => {
                                                            if (!c.fechaPago) return true;
                                                            const diffHours = (new Date().getTime() - new Date(c.fechaPago).getTime()) / (1000 * 60 * 60);
                                                            return diffHours <= 24;
                                                        })();
                                                        return (
                                                            <button
                                                                disabled={!esEditable}
                                                                onClick={() => handleAnularPago(c.id, c.nombre)}
                                                                title={!esEditable ? "El tiempo de gracia de 24 horas para anular este pago ha expirado" : "Anular este pago de cuota"}
                                                                style={{
                                                                    background: esEditable ? '#ef4444' : '#d1d5db',
                                                                    color: esEditable ? '#ffffff' : '#9ca3af',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    border: 'none',
                                                                    cursor: esEditable ? 'pointer' : 'not-allowed'
                                                                }}
                                                            >
                                                                Anular Pago
                                                            </button>
                                                        );
                                                    })()
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {comerciantesFiltrados.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                No se encontraron comerciantes que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Method Dialog Modal */}
            {pagoModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: 'var(--shadow-lg)',
                        textAlign: 'center'
                    }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 12px 0' }}>
                            Registrar Pago
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                            Por favor seleccione el método de pago utilizado por el comerciante <strong>{pagoModal.nombreCom}</strong>:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <button
                                onClick={() => {
                                    handleRegistrarPago(pagoModal.comercianteId, pagoModal.nombreCom, "Efectivo");
                                    setPagoModal(null);
                                }}
                                style={{
                                    background: 'var(--secondary)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Pagó en Efectivo
                            </button>
                            <button
                                onClick={() => {
                                    handleRegistrarPago(pagoModal.comercianteId, pagoModal.nombreCom, "QR");
                                    setPagoModal(null);
                                }}
                                style={{
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Pagó con QR
                            </button>
                        </div>

                        <button
                            onClick={() => setPagoModal(null)}
                            style={{
                                background: '#f3f4f6',
                                color: 'var(--text-secondary)',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
