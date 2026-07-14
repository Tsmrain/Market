const API_PANEL = 'http://localhost:8080/api/panel/comerciantes';

export const ComercianteService = {
    obtenerMisProductos: async (idComerciante: number): Promise<Array<{ id: number; nombre: string; precio: number; estaDisponible: boolean }>> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos`);
        if (!response.ok) throw new Error('Error al obtener catálogo de productos');
        return response.json();
    },

    alternarDisponibilidad: async (idComerciante: number, idProducto: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/disponibilidad`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al alternar disponibilidad');
    },

    agregarProducto: async (idComerciante: number, nombre: string, descripcion: string, precio: number, idCategoria: number, unidadMedida: string, archivos: File[]): Promise<void> => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', precio.toString());
        formData.append('idCategoria', idCategoria.toString());
        formData.append('unidadMedida', unidadMedida);
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`${API_PANEL}/${idComerciante}/productos`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al agregar el producto');
        }
    },

    editarProducto: async (idComerciante: number, idProducto: number, nombre: string, descripcion: string, precio: number, idCategoria: number, unidadMedida: string): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, precio, idCategoria, unidadMedida })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar el producto');
        }
    },

    subirMultimedia: async (idComerciante: number, idProducto: number, archivos: File[]): Promise<void> => {
        const formData = new FormData();
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/multimedia`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Error al subir archivos multimedia');
        }
    },

    eliminarMultimedia: async (idComerciante: number, idProducto: number, idMultimedia: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/multimedia/${idMultimedia}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar archivo multimedia');
        }
    },

    eliminarProducto: async (idComerciante: number, idProducto: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
    }
};
