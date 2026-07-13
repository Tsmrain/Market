// Reflejo exacto de ProductoResumenDTO del Backend
export interface ProductoResumen {
    id: number;
    nombre: string;
    precio: number;
    nombreCategoria: string;
    imagenPrincipal: string | null;
}

// Reflejo exacto de ProductoDetalleDTO del Backend
export interface ProductoDetalle {
    id: number;
    nombre: string;
    precio: number;
    nombreCategoria: string;
    cantidadInteresados: number;
    promedioEstrellas: number;
    comentarios: string[];
    galeriaUrls: string[];
}

// Reflejo de la paginación de Spring Data
export interface Page<T> {
    content: T[];
    totalPages: number;
    number: number; // Página actual
}

export interface CategoriaInfo {
    id: number;
    nombre: string;
    idCategoriaPadre: number | null;
}

export interface ProductoComerciante {
    id: number;
    nombre: string;
    precio: number;
    estaDisponible: boolean;
}


