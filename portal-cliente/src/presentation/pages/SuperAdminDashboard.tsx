import React, { useEffect, useState } from 'react';
import { SuperAdminService } from '../../application/SuperAdminService';
import { PanelGraficos } from '../components/PanelGraficos';

export const SuperAdminDashboard: React.FC = () => {
    // KPIs & Server Health
    const [kpis, setKpis] = useState<any>(null);
    const [healthStatus, setHealthStatus] = useState<string>("Cargando...");

    // Load data
    const cargarDashboard = async () => {
        try {
            const metricasData = await SuperAdminService.obtenerMetricas();
            setKpis(metricasData.kpis);
        } catch (err) {
            console.error("Error loading metrics:", err);
        }

        try {
            const healthData = await SuperAdminService.obtenerSaludActuator();
            setHealthStatus(healthData.status === 'UP' ? 'ACTIVO (UP)' : 'INACTIVO');
        } catch (err) {
            setHealthStatus("ERROR (OFFLINE)");
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    const getKpi = (key: string) => {
        if (!kpis) return "...";
        return kpis[key];
    };

    return (
        <div>
            {/* Server Health Status Card (Spring Boot Actuator) */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: healthStatus.includes('ACTIVO') ? '#22c55e' : '#ef4444',
                        boxShadow: healthStatus.includes('ACTIVO') ? '0 0 8px #22c55e' : '0 0 8px #ef4444'
                    }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        ESTADO DE SALUD DEL SERVIDOR (Spring Boot Actuator):
                    </span>
                </div>
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: healthStatus.includes('ACTIVO') ? '#22c55e' : '#ef4444',
                    background: healthStatus.includes('ACTIVO') ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: healthStatus.includes('ACTIVO') ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    {healthStatus}
                </span>
            </div>

            {/* Scorecards grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Card 1 */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comerciantes Activos</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px', marginBottom: 0 }}>{getKpi("comerciantesActivos")}</h2>
                </div>
                {/* Card 2 */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clientes Registrados</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px', marginBottom: 0 }}>{getKpi("clientesRegistrados")}</h2>
                </div>
                {/* Card 3 */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productos en Catálogo</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px', marginBottom: 0 }}>{getKpi("productosEnCatalogo")}</h2>
                </div>
                {/* Card 4 */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engagement (WhatsApp)</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px', marginBottom: 0 }}>{getKpi("interaccionesWhatsApp")} clics</h2>
                </div>
            </div>

            {/* Gráficos de Inteligencia de Negocio */}
            <PanelGraficos />
        </div>
    );
};
