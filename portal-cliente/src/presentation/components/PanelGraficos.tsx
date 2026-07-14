import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { SuperAdminService } from '../../application/SuperAdminService';

// Colors: Blue (#1a5c7a) and Orange (#d96c2b)
const COLORS = ['#1a5c7a', '#d96c2b', '#0f3d52', '#fdb813', '#6b7280', '#10b981'];

export const PanelGraficos: React.FC = () => {
    const [datosCategorias, setDatosCategorias] = useState<any[]>([]);
    const [datosInteracciones, setDatosInteracciones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarGraficos = async () => {
            try {
                const cats = await SuperAdminService.obtenerGraficoCategorias();
                const inters = await SuperAdminService.obtenerGraficoInteracciones();
                setDatosCategorias(cats);
                setDatosInteracciones(inters);
            } catch (err) {
                console.error("Error loading charts data:", err);
                setError("Error al cargar los gráficos de rendimiento.");
            } finally {
                setCargando(false);
            }
        };
        cargarGraficos();
    }, []);

    if (cargando) {
        return (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Cargando gráficos analíticos...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px' }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
            width: '100%'
        }}>
            {/* Gráfico 1: Productos por Categoría (Pie Chart) */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Distribución de Productos por Categoría
                </h4>
                <div style={{ flexGrow: 1, width: '100%', height: '240px' }}>
                    {datosCategorias.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            No hay productos registrados
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={datosCategorias}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="cantidad"
                                >
                                    {datosCategorias.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Gráfico 2: Top Comerciantes por Interacción (Bar Chart) */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Top 5 Comerciantes más Activos (WhatsApp)
                </h4>
                <div style={{ flexGrow: 1, width: '100%', height: '240px' }}>
                    {datosInteracciones.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            No hay interacciones registradas
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={datosInteracciones}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <XAxis dataKey="nombre" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                                <Tooltip formatter={(value) => [`${value} clics`, 'Interacciones']} />
                                <Bar dataKey="clics" fill="var(--secondary)" radius={[4, 4, 0, 0]}>
                                    {datosInteracciones.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--secondary)' : 'var(--primary)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};
