const API_ADMIN_COMERCIANTES = 'http://localhost:8080/api/admin/comerciantes';
const API_ADMIN_CATEGORIAS = 'http://localhost:8080/api/admin/categorias';
const API_RECAUDACION = 'http://localhost:8080/api/recaudacion';

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    const stored = localStorage.getItem('usuario_sesion');
    const sesion = stored ? JSON.parse(stored) : null;
    const headers: Record<string, string> = { ...extraHeaders };
    if (sesion && sesion.id) {
        headers['X-User-Id'] = sesion.id.toString();
    }
    return headers;
};

export const AdminService = {
    listarComerciantes: async (): Promise<Array<{ id: number; ci: string; nombre: string; telefono: string; numeroPuesto: string; cuentaHabilitada: boolean }>> => {
        const response = await fetch(API_ADMIN_COMERCIANTES, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Error al listar comerciantes');
        return response.json();
    },

    registrarComerciante: async (ci: string, expedido: string, pin: string, nombre: string, telefono: string, numeroPuesto: string): Promise<void> => {
        const response = await fetch(API_ADMIN_COMERCIANTES, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ ci, expedido, pin, nombre, telefono, numeroPuesto })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al registrar comerciante');
        }
    },

    editarComerciante: async (idComerciante: number, ci: string, expedido: string, nombre: string, telefono: string, numeroPuesto: string, pin?: string): Promise<void> => {
        const response = await fetch(`${API_ADMIN_COMERCIANTES}/${idComerciante}`, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ ci, expedido, nombre, telefono, numeroPuesto, pin: pin || undefined })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar comerciante');
        }
    },

    darDeBajaComerciante: async (idComerciante: number): Promise<void> => {
        const response = await fetch(`${API_ADMIN_COMERCIANTES}/${idComerciante}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Error al dar de baja al comerciante');
    },

    cambiarEstadoLicencia: async (idComerciante: number, habilitado: boolean): Promise<void> => {
        const response = await fetch(`${API_ADMIN_COMERCIANTES}/${idComerciante}/estado?habilitado=${habilitado}`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al cambiar estado de licencia');
        }
    },

    crearCategoria: async (nombre: string, idCategoriaPadre?: string): Promise<void> => {
        const response = await fetch(API_ADMIN_CATEGORIAS, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ nombre, idCategoriaPadre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al crear categoría');
        }
    },

    editarCategoria: async (idCategoria: number, nombre: string): Promise<void> => {
        const response = await fetch(`${API_ADMIN_CATEGORIAS}/${idCategoria}`, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ nombre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar categoría');
        }
    },

    eliminarCategoria: async (idCategoria: number): Promise<void> => {
        const response = await fetch(`${API_ADMIN_CATEGORIAS}/${idCategoria}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al eliminar categoría');
        }
    },

    anularPago: async (comercianteId: number, mes: number, anio: number, motivo: string): Promise<void> => {
        const response = await fetch(`${API_RECAUDACION}/anular/${comercianteId}?mes=${mes}&anio=${anio}`, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ motivo })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al anular pago de cuota');
        }
    }
};
