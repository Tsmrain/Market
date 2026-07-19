import type { Page, ProductoResumen, ProductoDetalle, CategoriaInfo } from '../domain/models';

const API_PORTAL = 'http://localhost:8080/api/portal';

export const CatalogoService = {
    obtenerCatalogo: async (page: number, size: number, buscar: string = '', idCategoria?: number, precioMin?: number, precioMax?: number, estrellasMinimas?: number): Promise<Page<ProductoResumen>> => {
        const queryBuscar = buscar ? `&buscar=${encodeURIComponent(buscar)}` : '';
        const queryCat = idCategoria !== undefined ? `&idCategoria=${idCategoria}` : '';
        const queryPrecioMin = precioMin !== undefined && precioMin !== null ? `&precioMin=${precioMin}` : '';
        const queryPrecioMax = precioMax !== undefined && precioMax !== null ? `&precioMax=${precioMax}` : '';
        const queryEstrellas = estrellasMinimas !== undefined && estrellasMinimas !== null ? `&estrellasMinimas=${estrellasMinimas}` : '';
        const response = await fetch(`${API_PORTAL}/productos?page=${page}&size=${size}${queryBuscar}${queryCat}${queryPrecioMin}${queryPrecioMax}${queryEstrellas}`);
        if (!response.ok) throw new Error('Error al obtener el catálogo');
        return response.json();
    },

    obtenerCategorias: async (): Promise<CategoriaInfo[]> => {
        const response = await fetch(`${API_PORTAL}/categorias`);
        if (!response.ok) throw new Error('Error al obtener las categorías');
        return response.json();
    },

    obtenerTodasLasCategorias: async (): Promise<CategoriaInfo[]> => {
        const response = await fetch(`${API_PORTAL}/categorias/todas`);
        if (!response.ok) throw new Error('Error al obtener todas las categorías');
        return response.json();
    },

    obtenerDetalle: async (idProducto: number): Promise<ProductoDetalle> => {
        const response = await fetch(`${API_PORTAL}/productos/${idProducto}`);
        if (!response.ok) throw new Error('Error al obtener detalle del producto');
        return response.json();
    },

    obtenerUnidades: async (): Promise<Array<{ id: number; codigo: string; nombre: string; admiteDecimales: boolean }>> => {
        const response = await fetch(`${API_PORTAL}/unidades`);
        if (!response.ok) throw new Error('Error al obtener unidades de medida');
        return response.json();
    },

    contactarComerciante: async (idComerciante: number, idProducto: number, idCliente?: number): Promise<string> => {
        const headers: any = {};
        if (idCliente) {
            headers['X-User-Id'] = String(idCliente);
        }
        const response = await fetch(`${API_PORTAL}/comerciantes/${idComerciante}/contactar?idProducto=${idProducto}`, {
            method: 'POST',
            headers
        });
        if (!response.ok) throw new Error('Error al generar enlace');
        const data = await response.json();
        return data.url;
    },

    // UC-A6: Me Interesa
    marcarInteres: async (idProducto: number, idCliente: number): Promise<void> => {
        const response = await fetch(`http://localhost:8080/api/productos/${idProducto}/interesados/${idCliente}`, {
            method: 'POST',
            headers: { 'X-User-Id': String(idCliente) }
        });
        if (!response.ok) throw new Error('Error al registrar interés');
    },

    // UC-A7: Agregar Reseña
    agregarResena: async (idProducto: number, idCliente: number, calificacion: number, comentario: string, evidencias?: File[]): Promise<void> => {
        const formData = new FormData();
        formData.append('calificacion', String(calificacion));
        formData.append('comentario', comentario);
        formData.append('idCliente', String(idCliente));
        if (evidencias && evidencias.length > 0) {
            evidencias.forEach(archivo => {
                formData.append('evidencias', archivo);
            });
        }

        const response = await fetch(`http://localhost:8080/api/productos/${idProducto}/resenas`, {
            method: 'POST',
            headers: { 
                'X-User-Id': String(idCliente)
            },
            body: formData
        });
        if (!response.ok) throw new Error('Error al agregar reseña');
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
    }
};
