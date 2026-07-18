import React, { useEffect, useState } from 'react';

export const LiquidacionesGlobales: React.FC = () => {
    const [mes, setMes] = useState<number>(() => new Date().getMonth() + 1);
    const [anio, setAnio] = useState<number>(() => new Date().getFullYear());
    const [liquidaciones, setLiquidaciones] = useState<any[]>([]);
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const cargarLiquidaciones = async () => {
        setCargando(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/superadmin/administradores/recaudacion/resumen?mes=${mes}&anio=${anio}`);
            if (res.ok) {
                const data = await res.json();
                setLiquidaciones(data);
            } else {
                setError("Error al cargar la liquidación mensual.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLiquidaciones();
    }, [mes, anio]);

    // Calcular Totales Generales
    const totalRecaudadoGlobal = liquidaciones.reduce((sum, item) => sum + (item.montoRecaudado || 0), 0);
    const totalComerciantesPagados = liquidaciones.reduce((sum, item) => sum + (item.comerciantesPagados || 0), 0);
    const totalComerciantesPendientes = liquidaciones.reduce((sum, item) => sum + (item.comerciantesPendientes || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filter and Title Card */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                        Resumen de Liquidaciones Globales
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Consulta del total consolidado y recaudado por cada asociación del mercado.
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

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                    {error}
                </div>
            )}

            {/* Premium KPIS Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: '#fff', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Monto Total Recaudado</span>
                    <span style={{ fontSize: '2rem', fontWeight: 900 }}>{totalRecaudadoGlobal.toFixed(2)} Bs.</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Basado en pagos mensuales registrados</span>
                </div>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Comerciantes Pagados</span>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>{totalComerciantesPagados}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Comerciantes activos al día</span>
                </div>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Comerciantes Pendientes</span>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--secondary)' }}>{totalComerciantesPendientes}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Pagos pendientes de cobro local</span>
                </div>
            </div>

            {/* Consolidated Table */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0' }}>
                    Desglose por Asociación de Comerciantes
                </h4>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '12px 8px' }}>ID Asociación</th>
                                <th style={{ padding: '12px 8px' }}>Asociación</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Comerciantes Al Día (Pagado)</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Comerciantes Pendientes</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total Recaudado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Cargando datos de recaudación...
                                    </td>
                                </tr>
                            ) : (
                                asociacionesList()
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    function asociacionesList() {
        return (
            <>
                {liquidaciones.map((liq: any) => (
                    <tr key={liq.asociacionId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--text-light)' }}>{liq.asociacionId}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{liq.asociacionNombre}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>
                            {liq.comerciantesPagados}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--secondary)', fontWeight: 700 }}>
                            {liq.comerciantesPendientes}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>
                            {liq.montoRecaudado.toFixed(2)} Bs.
                        </td>
                    </tr>
                ))}
                {liquidaciones.length === 0 && (
                    <tr>
                        <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No hay registros para este mes y año.
                        </td>
                    </tr>
                )}
            </>
        )
    }
};
