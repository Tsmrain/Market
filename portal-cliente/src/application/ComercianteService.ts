import type { ComerciantePerfil } from '../domain/models';

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

    agregarProducto: async (idComerciante: number, nombre: string, descripcion: string, precio: number, idCategoria: number, unidadMedida: string, archivos: File[], marca: string): Promise<void> => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', precio.toString());
        formData.append('idCategoria', idCategoria.toString());
        formData.append('unidadMedida', unidadMedida);
        formData.append('marca', marca);
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`${API_PANEL}/${idComerciante}/productos`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errMsg = data.error || data.message || data.mensaje || 'Error al agregar el producto';
            throw new Error(errMsg);
        }
    },

    editarProducto: async (idComerciante: number, idProducto: number, nombre: string, descripcion: string, precio: number, idCategoria: number, unidadMedida: string, marca: string): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, precio, idCategoria, unidadMedida, marca })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errMsg = data.error || data.message || data.mensaje || 'Error al editar el producto';
            throw new Error(errMsg);
        }
    },

    subirMultimedia: async (idComerciante: number, idProducto: number, archivos: File[]): Promise<Array<{ id: number; url: string; tipo: string }>> => {
        const formData = new FormData();
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/multimedia`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Error al subir archivos multimedia');
        }
        return response.json();
    },

    eliminarMultimedia: async (idComerciante: number, idProducto: number, idMultimedia: number): Promise<Array<{ id: number; url: string; tipo: string }>> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/multimedia/${idMultimedia}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar archivo multimedia');
        }
        return response.json();
    },

    eliminarProducto: async (idComerciante: number, idProducto: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
    },

    obtenerPerfil: async (idComerciante: number): Promise<ComerciantePerfil> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/perfil`);
        if (!response.ok) throw new Error('Error al obtener perfil');
        return response.json();
    },

    actualizarPerfil: async (idComerciante: number, perfil: ComerciantePerfil): Promise<ComerciantePerfil> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfil)
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al actualizar perfil');
        }
        return response.json();
    }
};
