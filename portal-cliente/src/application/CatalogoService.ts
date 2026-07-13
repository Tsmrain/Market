import type { Page, ProductoResumen, ProductoDetalle, CategoriaInfo, ProductoComerciante } from '../domain/models';

const API_URL = 'http://localhost:8080/api/portal';
const API_INTERACCION = 'http://localhost:8080/api/productos';
const API_PANEL = 'http://localhost:8080/api/panel/comerciantes';

export const CatalogoService = {
    obtenerCatalogo: async (page: number, size: number, buscar: string = '', idCategoria?: number): Promise<Page<ProductoResumen>> => {
        const queryBuscar = buscar ? `&buscar=${encodeURIComponent(buscar)}` : '';
        const queryCat = idCategoria !== undefined ? `&idCategoria=${idCategoria}` : '';
        const response = await fetch(`${API_URL}/productos?page=${page}&size=${size}${queryBuscar}${queryCat}`);
        if (!response.ok) throw new Error('Error al obtener el catálogo');
        return response.json();
    },

    obtenerCategorias: async (): Promise<CategoriaInfo[]> => {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) throw new Error('Error al obtener las categorías');
        return response.json();
    },

    obtenerTodasLasCategorias: async (): Promise<CategoriaInfo[]> => {
        const response = await fetch(`${API_URL}/categorias/todas`);
        if (!response.ok) throw new Error('Error al obtener las categorías');
        return response.json();
    },

    obtenerDetalle: async (idProducto: number): Promise<ProductoDetalle> => {
        const response = await fetch(`${API_URL}/productos/${idProducto}`);
        if (!response.ok) throw new Error('Error al obtener detalle del producto');
        return response.json();
    },

    subirMultimedia: async (idProducto: number, archivos: File[]): Promise<void> => {
        const formData = new FormData();
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`http://localhost:8080/api/comerciante/productos/${idProducto}/multimedia`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Error al subir los archivos multimedia');
    },

    contactarComerciante: async (idComerciante: number, idProducto?: number): Promise<string> => {
        const query = idProducto !== undefined ? `?idProducto=${idProducto}` : '';
        const response = await fetch(`${API_URL}/comerciantes/${idComerciante}/contactar${query}`, { method: 'POST' });
        if (!response.ok) throw new Error('Error al generar enlace');
        const data = await response.json();
        return data.url;
    },

    crearCategoria: async (nombre: string, idCategoriaPadre?: string): Promise<void> => {
        const response = await fetch('http://localhost:8080/api/admin/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, idCategoriaPadre })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al crear la categoría');
        }
    },

    // UC-A6: Me Interesa
    marcarInteres: async (idProducto: number, idCliente: number): Promise<void> => {
        const response = await fetch(`${API_INTERACCION}/${idProducto}/interesados/${idCliente}`, { method: 'POST' });
        if (!response.ok) throw new Error('Error al registrar interés');
    },

    // UC-A7: Agregar Reseña
    agregarResena: async (idProducto: number, idCliente: number, calificacion: number, comentario: string): Promise<void> => {
        const response = await fetch(`${API_INTERACCION}/${idProducto}/resenas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idCliente, calificacion, comentario })
        });
        if (!response.ok) throw new Error('Error al registrar reseña');
    },

    // UC-B2: Catálogo Privado del Comerciante
    obtenerMisProductos: async (idComerciante: number): Promise<ProductoComerciante[]> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos`);
        if (!response.ok) throw new Error('Error al obtener catálogo del comerciante');
        return response.json();
    },

    alternarDisponibilidad: async (idComerciante: number, idProducto: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}/disponibilidad`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al alternar disponibilidad del producto');
    },

    eliminarProducto: async (idComerciante: number, idProducto: number): Promise<void> => {
        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
    },

    agregarProducto: async (idComerciante: number, nombre: string, precio: number, idCategoria: number, archivos: File[]): Promise<void> => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('precio', precio.toString());
        formData.append('idCategoria', idCategoria.toString());
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

    editarProducto: async (idComerciante: number, idProducto: number, nombre: string, precio: number, archivos: File[]): Promise<void> => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('precio', precio.toString());
        archivos.forEach(archivo => formData.append('archivos', archivo));

        const response = await fetch(`${API_PANEL}/${idComerciante}/productos/${idProducto}`, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al editar el producto');
        }
    },

    // Perfil del Cliente
    obtenerPerfilCliente: async (idCliente: number): Promise<{ ci: string; nombre: string; celular: string }> => {
        const response = await fetch(`http://localhost:8080/api/clientes/${idCliente}`);
        if (!response.ok) throw new Error('Error al obtener perfil');
        return response.json();
    },

    actualizarPerfilCliente: async (idCliente: number, nombre: string, celular: string, pin?: string): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/clientes/${idCliente}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, celular, pin: pin || undefined })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al actualizar perfil');
        }
    },

    // CRUD Comerciantes (Admin)
    listarComerciantes: async (): Promise<Array<{ id: number; ci: string; nombre: string; telefono: string }>> => {
        const response = await fetch('http://localhost:8080/api/admin/comerciantes');
        if (!response.ok) throw new Error('Error al listar comerciantes');
        return response.json();
    },

    editarComerciante: async (idComerciante: number, nombre: string, telefono: string, pin?: string): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/admin/comerciantes/${idComerciante}`, {
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
        const response = await fetch(`http://localhost:8080/api/admin/comerciantes/${idComerciante}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al dar de baja al comerciante');
    },

    // CRUD Categorías (Admin)
    editarCategoria: async (idCategoria: number, nombre: string): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/admin/categorias/${idCategoria}`, {
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
        const response = await fetch(`http://localhost:8080/api/admin/categorias/${idCategoria}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar la categoría');
    }
};
