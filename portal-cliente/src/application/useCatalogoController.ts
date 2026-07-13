import { useState, useEffect } from 'react';
import { CatalogoService } from './CatalogoService';
import type { Page, ProductoResumen, CategoriaInfo } from '../domain/models';

// Memoria global simple para simular caché entre navegaciones
const cachePaginas = new Map<string, Page<ProductoResumen>>();

export const useCatalogoController = () => {
    const [paginaActual, setPaginaActual] = useState<number>(0);
    const [busqueda, setBuscar] = useState<string>('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | undefined>(undefined);
    const [categorias, setCategorias] = useState<CategoriaInfo[]>([]);
    const [datos, setDatos] = useState<Page<ProductoResumen> | null>(null);
    const [cargando, setCargando] = useState<boolean>(false);

    // Cargar listado de categorías al montar el componente
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const resultado = await CatalogoService.obtenerCategorias();
                setCategorias(resultado);
            } catch (error) {
                console.error("Error al cargar categorías", error);
            }
        };
        cargarCategorias();
    }, []);

    // Cargar productos al cambiar página, búsqueda o categoría
    useEffect(() => {
        const cargarDatos = async () => {
            const catKey = categoriaSeleccionada !== undefined ? categoriaSeleccionada : 'all';
            const cacheKey = `${busqueda}-${catKey}-${paginaActual}`;
            
            // Decisión Arquitectónica: Verificar Caché antes de red (Tu regla #2)
            if (cachePaginas.has(cacheKey)) {
                setDatos(cachePaginas.get(cacheKey)!);
                return;
            }

            setCargando(true);
            try {
                const resultado = await CatalogoService.obtenerCatalogo(
                    paginaActual, 
                    20, 
                    busqueda, 
                    categoriaSeleccionada
                );
                cachePaginas.set(cacheKey, resultado); // Guardar en caché
                setDatos(resultado);
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [paginaActual, busqueda, categoriaSeleccionada]);

    const cambiarPagina = (nuevaPagina: number) => {
        setPaginaActual(nuevaPagina);
    };

    const buscarProducto = (termino: string) => {
        setBuscar(termino);
        setPaginaActual(0); // Reiniciar a la primera página al buscar
    };

    const seleccionarCategoria = (idCategoria: number | undefined) => {
        setCategoriaSeleccionada(idCategoria);
        setPaginaActual(0); // Reiniciar a la primera página al filtrar por categoría
    };

    return { 
        datos, 
        cargando, 
        paginaActual, 
        cambiarPagina, 
        buscarProducto,
        categorias,
        categoriaSeleccionada,
        seleccionarCategoria
    };
};
