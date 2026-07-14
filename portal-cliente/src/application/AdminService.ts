const API_ADMIN_COMERCIANTES = 'http://localhost:8080/api/admin/comerciantes';
const API_ADMIN_CATEGORIAS = 'http://localhost:8080/api/admin/categorias';

export const AdminService = {
    listarComerciantes: async (): Promise<Array<{ id: number; ci: string; nombre: string; telefono: string }>> => {
        const response = await fetch(API_ADMIN_COMERCIANTES);
        if (!response.ok) throw new Error('Error al listar comerciantes');
        return response.json();
    },

    editarComerciante: async (idComerciante: number, nombre: string, telefono: string, pin?: string): Promise<void> => {
        const response = await fetch(`${API_ADMIN_COMERCIANTES}/${idComerciante}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, telefono, pin: pin || undefined })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar comerciante');
        }
    },

    darDeBajaComerciante: async (idComerciante: number): Promise<void> => {
        const response = await fetch(`${API_ADMIN_COMERCIANTES}/${idComerciante}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al dar de baja al comerciante');
    },

    crearCategoria: async (nombre: string, idCategoriaPadre?: string): Promise<void> => {
        const response = await fetch(API_ADMIN_CATEGORIAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, idCategoriaPadre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al crear la categoría');
        }
    },

    editarCategoria: async (idCategoria: number, nombre: string): Promise<void> => {
        const response = await fetch(`${API_ADMIN_CATEGORIAS}/${idCategoria}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar la categoría');
        }
    },

    eliminarCategoria: async (idCategoria: number): Promise<void> => {
        const response = await fetch(`${API_ADMIN_CATEGORIAS}/${idCategoria}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar la categoría');
    }
};
