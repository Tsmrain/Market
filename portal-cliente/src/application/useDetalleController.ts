import { useState, useEffect } from 'react';
import { CatalogoService } from './CatalogoService';
import type { ProductoDetalle } from '../domain/models';
import { useAuthController } from './useAuthController';
import { useTranslation } from 'react-i18next';

export const useDetalleController = (idProductoStr: string | undefined) => {
    const [producto, setProducto] = useState<ProductoDetalle | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);
    const { usuario, estaAutenticado } = useAuthController();
    const { t } = useTranslation();

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
        if (!estaAutenticado || !producto) return alert(t('debes_iniciar_sesion'));
        
        // Copia de seguridad del estado previo (Rollback UI)
        const previousProducto = producto ? { ...producto } : null;

        // Mutación Optimista instantánea
        setProducto(prev => prev ? { ...prev, cantidadInteresados: prev.cantidadInteresados + 1 } : null);

        try {
            await CatalogoService.marcarInteres(producto.id, usuario!.id);
            alert(t('interes_registrado'));
        } catch (error) {
            // Revertir estado si falla la petición
            setProducto(previousProducto);
            alert(t('error_conexion'));
        }
    };

    const handleResena = async (calificacion: number, comentario: string) => {
        if (!estaAutenticado || !producto) return alert(t('debes_iniciar_sesion'));
        
        // Copia de seguridad del estado previo (Rollback UI)
        const previousProducto = producto ? { ...producto } : null;

        const nuevaResena = {
            nombreCliente: usuario ? usuario.nombre : 'Cliente Anónimo',
            calificacion: calificacion,
            comentario: comentario,
            esPropietario: usuario && producto.idComerciante !== undefined ? (Number(usuario.id) === Number(producto.idComerciante)) : false
        };

        // Mutación Optimista instantánea
        setProducto(prev => {
            if (!prev) return null;
            const nuevasResenas = [nuevaResena, ...(prev.resenas || [])];
            const nuevosComentarios = [comentario, ...prev.comentarios];
            const totalEstrellas = prev.promedioEstrellas * prev.comentarios.length + calificacion;
            const nuevoPromedio = nuevosComentarios.length > 0 ? totalEstrellas / nuevosComentarios.length : calificacion;
            return {
                ...prev,
                resenas: nuevasResenas,
                comentarios: nuevosComentarios,
                promedioEstrellas: nuevoPromedio
            };
        });

        try {
            await CatalogoService.agregarResena(producto.id, usuario!.id, calificacion, comentario);
            alert(t('resena_exito'));
        } catch (error) {
            // Revertir estado si falla la petición
            setProducto(previousProducto);
            alert(t('error_conexion'));
        }
    };

    return { producto, cargando, usuario, estaAutenticado, handleMeInteresa, handleResena };
};
