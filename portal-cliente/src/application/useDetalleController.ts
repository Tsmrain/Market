import { useState, useEffect } from 'react';
import { CatalogoService } from './CatalogoService';
import type { ProductoDetalle } from '../domain/models';
import { useAuthController } from './useAuthController';

export const useDetalleController = (idProductoStr: string | undefined) => {
    const [producto, setProducto] = useState<ProductoDetalle | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);
    const { usuario, estaAutenticado } = useAuthController();

    useEffect(() => {
        if (!idProductoStr) return;
        const cargar = async () => {
            setCargando(true);
            try {
                const data = await CatalogoService.obtenerDetalle(Number(idProductoStr));
                setProducto(data);
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [idProductoStr]);

    const handleMeInteresa = async () => {
        if (!estaAutenticado || !producto) return alert("Debes iniciar sesión");
        await CatalogoService.marcarInteres(producto.id, usuario!.id);
        alert("¡Interés registrado!");
        // En una app real, recargaríamos el producto para actualizar el número de interesados
    };

    const handleResena = async (calificacion: number, comentario: string) => {
        if (!estaAutenticado || !producto) return alert("Debes iniciar sesión");
        await CatalogoService.agregarResena(producto.id, usuario!.id, calificacion, comentario);
        alert("¡Reseña agregada con éxito!");
    };

    return { producto, cargando, usuario, estaAutenticado, handleMeInteresa, handleResena };
};
