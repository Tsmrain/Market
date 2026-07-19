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

    // Filtros de entrada (en UI)
    const [inputPrecioMin, setInputPrecioMin] = useState<string>('');
    const [inputPrecioMax, setInputPrecioMax] = useState<string>('');
    const [inputEstrellas, setInputEstrellas] = useState<number | undefined>(undefined);

    // Filtros aplicados activos
    const [precioMin, setPrecioMin] = useState<number | undefined>(undefined);
    const [precioMax, setPrecioMax] = useState<number | undefined>(undefined);
    const [estrellasMinimas, setEstrellasMinimas] = useState<number | undefined>(undefined);

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

    // Cargar productos al cambiar página, búsqueda, categoría o filtros activos
    useEffect(() => {
        const cargarDatos = async () => {
            const catKey = categoriaSeleccionada !== undefined ? categoriaSeleccionada : 'all';
            const pMinKey = precioMin !== undefined ? precioMin : 'none';
            const pMaxKey = precioMax !== undefined ? precioMax : 'none';
            const estKey = estrellasMinimas !== undefined ? estrellasMinimas : 'none';
            const cacheKey = `${busqueda}-${catKey}-${pMinKey}-${pMaxKey}-${estKey}-${paginaActual}`;

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
                    categoriaSeleccionada,
                    precioMin,
                    precioMax,
                    estrellasMinimas
                );
                cachePaginas.set(cacheKey, resultado);
                setDatos(resultado);
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [paginaActual, busqueda, categoriaSeleccionada, precioMin, precioMax, estrellasMinimas]);

    const cambiarPagina = (nuevaPagina: number) => {
        setPaginaActual(nuevaPagina);
    };

    const buscarProducto = (termino: string) => {
        setBuscar(termino);
        setPaginaActual(0);
    };

    const seleccionarCategoria = (idCategoria: number | undefined) => {
        setCategoriaSeleccionada(idCategoria);
        setPaginaActual(0);
    };

    const aplicarFiltros = () => {
        setPrecioMin(inputPrecioMin.trim() ? parseFloat(inputPrecioMin) : undefined);
        setPrecioMax(inputPrecioMax.trim() ? parseFloat(inputPrecioMax) : undefined);
        setEstrellasMinimas(inputEstrellas);
        setPaginaActual(0);
    };

    const limpiarFiltros = () => {
        setInputPrecioMin('');
        setInputPrecioMax('');
        setInputEstrellas(undefined);
        setPrecioMin(undefined);
        setPrecioMax(undefined);
        setEstrellasMinimas(undefined);
        setPaginaActual(0);
    };

    return {
        datos,
        cargando,
        paginaActual,
        cambiarPagina,
        buscarProducto,
        categorias,
        categoriaSeleccionada,
        seleccionarCategoria,
        inputPrecioMin,
        setInputPrecioMin,
        inputPrecioMax,
        setInputPrecioMax,
        inputEstrellas,
        setInputEstrellas,
        aplicarFiltros,
        limpiarFiltros
    };
};
