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

    listarAdministradores: async (): Promise<Array<{ id: number; ci: string; expedido: string; nombre: string; telefono: string }>> => {
        const response = await fetch(API_SUPERADMIN);
        if (!response.ok) throw new Error('Error al listar administradores');
        return response.json();
    },

    crearAdministrador: async (ci: string, expedido: string, pin: string, nombre: string, telefono: string): Promise<void> => {
        const response = await fetch(API_SUPERADMIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ci, expedido, pin, nombre, telefono })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al registrar al administrador');
        }
    },

    editarAdministrador: async (id: number, nombre: string, pin?: string, telefono?: string): Promise<void> => {
        const response = await fetch(`${API_SUPERADMIN}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, pin: pin || undefined, telefono })
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
    },

    listarUnidades: async (): Promise<Array<{ id: number; codigo: string; nombre: string; admiteDecimales: boolean }>> => {
        const response = await fetch('http://localhost:8080/api/superadmin/unidades');
        if (!response.ok) throw new Error('Error al listar unidades de medida');
        return response.json();
    },

    crearUnidad: async (codigo: string, nombre: string, admiteDecimales: boolean): Promise<void> => {
        const response = await fetch('http://localhost:8080/api/superadmin/unidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre, admiteDecimales })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al crear unidad de medida');
        }
    },

    editarUnidad: async (id: number, codigo: string, nombre: string, admiteDecimales: boolean): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/superadmin/unidades/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre, admiteDecimales })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.message || 'Error al actualizar unidad de medida');
        }
    },

    eliminarUnidad: async (id: number): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/superadmin/unidades/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar unidad de medida');
    }
};
