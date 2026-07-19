import React, { useEffect, useState } from 'react';
import { useAuthController } from '../../application/useAuthController';

export const HistorialPagos: React.FC = () => {
    const { usuario } = useAuthController();
    const [facturas, setFacturas] = useState<any[]>([]);
    const [proximaFechaPago, setProximaFechaPago] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const cargarHistorial = async () => {
        if (!usuario) return;
        setCargando(true);
        setError("");
        try {
            const res = await fetch('http://localhost:8080/api/portal/comerciantes/mis-facturas', {
                headers: {
                    'X-User-Id': usuario.id.toString()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setFacturas(data.facturas || []);
                setProximaFechaPago(data.proximaFechaPago || "");
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || "No se pudo cargar el historial de pagos.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    const refrescarSilencioso = async () => {
        if (!usuario) return;
        try {
            const res = await fetch('http://localhost:8080/api/portal/comerciantes/mis-facturas', {
                headers: {
                    'X-User-Id': usuario.id.toString()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setFacturas(data.facturas || []);
                setProximaFechaPago(data.proximaFechaPago || "");
            }
        } catch (err) {
            // ignore silent fetch errors
        }
    };

    useEffect(() => {
        cargarHistorial();

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refrescarSilencioso();
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [usuario]);

    const getNombreMes = (num: number) => {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[num - 1] || `Mes ${num}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
            <div style={{
                background: 'var(--card-bg)',
                border: '3px solid var(--primary-dark)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Mis Facturas del Sistema
                </h2>
            </div>

            {proximaFechaPago && (
                <div style={{
                    background: '#eff6ff',
                    border: '3px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '24px',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#1e3a8a',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    Próxima Factura: {proximaFechaPago}
                </div>
            )}

            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '3px solid #ef4444',
                    color: '#b91c1c',
                    padding: '20px',
                    borderRadius: '8px',
                    fontSize: '1.25rem',
                    fontWeight: 700
                }}>
                    Error: {error}
                </div>
            )}

            {cargando ? (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Cargando facturas... Por favor espere.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {facturas.map((f: any) => {
                        const esPagado = f.estado === 'PAGADO';
                        const esAnulado = !esPagado && f.motivoAnulacion;

                        // Estilo según estado
                        let cardBg = '#f0fdf4'; // Light green
                        let cardBorder = '4px solid #22c55e'; // Thick green
                        let textColor = '#15803d'; // Strong green
                        let titleText = 'FACTURA PAGADA';

                        if (!esPagado) {
                            if (esAnulado) {
                                cardBg = '#fffbeb'; // Light orange/yellow
                                cardBorder = '4px solid #f59e0b'; // Thick orange
                                textColor = '#b45309'; // Strong orange
                                titleText = 'DEUDA PENDIENTE';
                            } else {
                                cardBg = '#fef2f2'; // Light red
                                cardBorder = '4px solid #ef4444'; // Thick red
                                textColor = '#b91c1c'; // Strong red
                                titleText = 'DEUDA PENDIENTE';
                            }
                        }

                        return (
                            <div key={f.id} style={{
                                background: cardBg,
                                border: cardBorder,
                                borderRadius: '12px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                boxShadow: 'var(--shadow-md)',
                                color: '#111827'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: textColor }}>
                                        {getNombreMes(f.mes)} {f.anio}
                                    </span>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', background: 'rgba(255, 255, 255, 0.7)', padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        {f.monto.toFixed(2)} Bs.
                                    </span>
                                </div>

                                <div style={{
                                    fontSize: '1.6rem',
                                    fontWeight: 900,
                                    color: textColor,
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {titleText}
                                </div>

                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    lineHeight: '1.6',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    color: '#374151'
                                }}>
                                    {esPagado ? (
                                        <>
                                            <div>
                                                • Método de Pago: <strong style={{ color: '#111827' }}>{f.metodoPago || 'Efectivo'}</strong>
                                            </div>
                                            <div>
                                                • Cobrado por: <strong style={{ color: '#111827' }}>{f.registradoPor || 'Administrador'}</strong>
                                            </div>
                                            <div>
                                                • Fecha del Pago: <strong style={{ color: '#111827' }}>{f.fechaPago ? new Date(f.fechaPago).toLocaleString() : '---'}</strong>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {esAnulado ? (
                                                <div style={{
                                                    background: '#fffbeb',
                                                    border: '2px dashed #f59e0b',
                                                    padding: '16px',
                                                    borderRadius: '8px',
                                                    color: '#b45309',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    <strong style={{ textTransform: 'uppercase' }}>Anulado por:</strong> {f.anuladoPor || 'Administrador'}
                                                    <div style={{ marginTop: '6px' }}>
                                                        <strong>Razón:</strong> "{f.motivoAnulacion}"
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#b91c1c', fontSize: '1.2rem', fontWeight: 800 }}>
                                                    • Debe pagar la Factura del Sistema de este mes.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Historial de Auditoría (Transaction Log) */}
                                {f.auditorias && f.auditorias.length > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        paddingTop: '12px',
                                        borderTop: '2px dashed rgba(0,0,0,0.1)',
                                        fontSize: '1.1rem',
                                        color: '#4b5563'
                                    }}>
                                        <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem', color: '#1f2937', marginBottom: '8px' }}>
                                            Historial de Auditoría de la Factura:
                                        </div>
                                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {f.auditorias.map((a: any) => (
                                                <li key={a.id} style={{
                                                    background: 'rgba(255, 255, 255, 0.5)',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(0,0,0,0.05)'
                                                }}>
                                                    • <strong>{a.accion === 'REGISTRO' ? 'Cobro Registrado' : 'Pago Anulado'}</strong> por <strong>{a.actor}</strong> el {new Date(a.fechaHora).toLocaleString()}
                                                    <div style={{ fontSize: '0.95rem', fontStyle: 'italic', marginTop: '2px', marginLeft: '12px' }}>
                                                        Detalle: "{a.detalle}"
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {facturas.length === 0 && (
                        <div style={{
                            background: 'var(--card-bg)',
                            border: '3px dashed var(--border-color)',
                            borderRadius: '12px',
                            padding: '40px',
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)'
                        }}>
                            No hay facturas registradas en el sistema todavía.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
