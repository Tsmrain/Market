import { useState } from 'react';

export interface UsuarioSesion {
    id: number;
    nombre: string;
    rol: 'COMERCIANTE' | 'CLIENTE' | 'ADMIN';
}

export const useAuthController = () => {
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
        const stored = localStorage.getItem('usuario_sesion');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        // Fallback de cliente para permitir reseñas e intereses en el portal
        return { id: 500, nombre: "Invitado", rol: "CLIENTE" };
    });

    const loginComerciante = async (ci: string, pin: string): Promise<void> => {
        // Intercepción del Administrador para pruebas del MVP sin base de datos administrativa
        if (ci === 'admin' && pin === '9999') {
            const sesion: UsuarioSesion = {
                id: 999,
                nombre: "Administrador del Mercado",
                rol: "ADMIN"
            };
            localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
            setUsuario(sesion);
            return;
        }

        const response = await fetch('http://localhost:8080/api/auth/comerciantes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ci, pin })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Credenciales incorrectas');
        }

        const data = await response.json(); // { id, nombre, rol }
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const loginCliente = async (ci: string, pin: string): Promise<void> => {
        const response = await fetch('http://localhost:8080/api/auth/clientes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ci, pin })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Credenciales incorrectas');
        }

        const data = await response.json(); // { id, nombre, rol }
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const registrarCliente = async (ci: string, pin: string, nombre: string, celular: string): Promise<void> => {
        const response = await fetch('http://localhost:8080/api/auth/clientes/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ci, pin, nombre, celular })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al registrarse');
        }

        const data = await response.json(); // { id, nombre, rol }
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const logout = () => {
        localStorage.removeItem('usuario_sesion');
        setUsuario({ id: 500, nombre: "Invitado", rol: "CLIENTE" });
    };

    return { 
        usuario, 
        estaAutenticado: usuario !== null && usuario.id !== 500,
        esComerciante: usuario !== null && usuario.rol === 'COMERCIANTE',
        esAdmin: usuario !== null && usuario.rol === 'ADMIN',
        esCliente: usuario !== null && usuario.rol === 'CLIENTE' && usuario.id !== 500,
        loginComerciante,
        loginCliente,
        registrarCliente,
        logout
    };
};
