export interface ProductoResumen {
    id: number;
    nombre: string;
    precio: number;
    nombreCategoria: string;
    imagenPrincipal: string | null;
    estaDisponible: boolean;
    unidadMedida: string;
    descripcion: string;
}

export interface ResenaInfo {
    nombreCliente: string;
    calificacion: number;
    comentario: string;
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
    resenas: ResenaInfo[];
    galeriaUrls: string[];
    idComerciante?: number;
    nombreComerciante?: string;
    telefonoComerciante?: string;
    numeroPuesto?: string;
    galeria?: Array<{ id: number; url: string; tipo: string }>;
    estaDisponible: boolean;
    unidadMedida: string;
    descripcion: string;
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

export interface ComerciantePerfil {
    nombre: string;
    telefono: string;
    numeroPuesto: string | null;
}


