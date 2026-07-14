const API_SUPERADMIN = 'http://localhost:8080/api/superadmin/administradores';
const API_METRICAS = 'http://localhost:8080/api/admin/metricas';

export const SuperAdminService = {
    obtenerMetricas: async (): Promise<{ kpis: { comerciantesActivos: number; clientesRegistrados: number; productosEnCatalogo: number; interaccionesWhatsApp: number } }> => {
        const response = await fetch(`${API_METRICAS}/dashboard`);
        if (!response.ok) throw new Error('Error al obtener métricas');
        return response.json();
    },

    obtenerSaludActuator: async (): Promise<{ status: string }> => {
        const response = await fetch('http://localhost:8080/actuator/health');
        if (!response.ok) throw new Error('Error al obtener salud del servidor');
        return response.json();
    },

    listarAdministradores: async (): Promise<Array<{ id: number; ci: string; nombre: string }>> => {
        const response = await fetch(API_SUPERADMIN);
        if (!response.ok) throw new Error('Error al listar administradores');
        return response.json();
    },

    crearAdministrador: async (ci: string, pin: string, nombre: string): Promise<void> => {
        const response = await fetch(API_SUPERADMIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ci, pin, nombre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al registrar al administrador');
        }
    },

    editarAdministrador: async (id: number, nombre: string, pin?: string): Promise<void> => {
        const response = await fetch(`${API_SUPERADMIN}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, pin: pin || undefined })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al actualizar al administrador');
        }
    },

    eliminarAdministrador: async (id: number): Promise<void> => {
        const response = await fetch(`${API_SUPERADMIN}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar al administrador');
    },

    obtenerGraficoCategorias: async (): Promise<Array<{ nombre: string; cantidad: number }>> => {
        const response = await fetch(`${API_METRICAS}/graficos/categorias`);
        if (!response.ok) throw new Error('Error al obtener datos de categorías');
        return response.json();
    },

    obtenerGraficoInteracciones: async (): Promise<Array<{ nombre: string; clics: number }>> => {
        const response = await fetch(`${API_METRICAS}/graficos/interacciones`);
        if (!response.ok) throw new Error('Error al obtener datos de interacciones');
        return response.json();
    }
};
