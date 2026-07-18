import { useState, useEffect } from 'react';

export interface UsuarioSesion {
    id: number;
    nombre: string;
    rol: 'COMERCIANTE' | 'CLIENTE' | 'ADMIN' | 'SUPERADMIN' | 'ADMIN_ASOCIACION';
    nombreAsociacion?: string;
    token?: string;
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
        return { id: 500, nombre: "Invitado", rol: "CLIENTE" };
    });

    useEffect(() => {
        const handleSessionChange = () => {
            const stored = localStorage.getItem('usuario_sesion');
            if (stored) {
                try {
                    setUsuario(JSON.parse(stored));
                } catch (e) {}
            }
        };
        window.addEventListener('usuario_sesion_changed', handleSessionChange);
        window.addEventListener('storage', handleSessionChange);
        return () => {
            window.removeEventListener('usuario_sesion_changed', handleSessionChange);
            window.removeEventListener('storage', handleSessionChange);
        };
    }, []);

    const loginComerciante = async (ci: string, pin: string): Promise<void> => {
        const response = await originalFetch('http://localhost:8080/api/auth/login', {
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

        const data = await response.json();
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol,
            nombreAsociacion: data.nombreAsociacion,
            token: data.token
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const loginCliente = async (ci: string, pin: string): Promise<void> => {
        const response = await originalFetch('http://localhost:8080/api/auth/clientes/login', {
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

        const data = await response.json();
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol,
            token: data.token
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const registrarCliente = async (ci: string, expedido: string, pin: string, nombre: string, celular: string): Promise<void> => {
        const response = await originalFetch('http://localhost:8080/api/auth/clientes/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ci, expedido, pin, nombre, celular })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Error al registrarse');
        }

        const data = await response.json();
        const sesion: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            rol: data.rol,
            token: data.token
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
        setUsuario(sesion);
    };

    const logout = () => {
        localStorage.removeItem('usuario_sesion');
        setUsuario({ id: 500, nombre: "Invitado", rol: "CLIENTE" });
    };

    // Referencia interna al fetch nativo sin interceptar para evitar bucles durante el login
    const originalFetch = window.fetch;

    return { 
        usuario, 
        estaAutenticado: usuario !== null && usuario.id !== 500,
        esComerciante: usuario !== null && usuario.rol === 'COMERCIANTE',
        esAdmin: usuario !== null && (usuario.rol === 'ADMIN' || usuario.rol === 'ADMIN_ASOCIACION'),
        esAdminAsociacion: usuario !== null && usuario.rol === 'ADMIN_ASOCIACION',
        esSuperAdmin: usuario !== null && usuario.rol === 'SUPERADMIN',
        esCliente: usuario !== null && usuario.rol === 'CLIENTE' && usuario.id !== 500,
        loginComerciante,
        loginCliente,
        registrarCliente,
        logout
    };
};
