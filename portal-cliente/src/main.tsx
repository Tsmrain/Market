import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18n from './locales/i18n'

// Interceptor global fetch (Expiración de Sesión & i18n Accept-Language)
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
    const stored = localStorage.getItem('usuario_sesion');
    let token = "";
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u.token) token = u.token;
        } catch (e) {}
    }

    let nextInit = init || {};
    const headers = new Headers(nextInit.headers || {});

    // 1. Inyectar Bearer Token para autenticación
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', 'Bearer ' + token);
    }

    // 2. Inyectar Idioma actual para localización en backend
    if (!headers.has('Accept-Language')) {
        headers.set('Accept-Language', i18n.language || 'es');
    }

    nextInit.headers = headers;

    const response = await originalFetch(input, nextInit);

    // Detectar 401 Unauthorized globales y desloguear
    if (response.status === 401) {
        let isSuper = false;
        if (stored) {
            try {
                const u = JSON.parse(stored);
                if (u.rol === 'SUPERADMIN') isSuper = true;
            } catch (e) {}
        }
        localStorage.removeItem('usuario_sesion');
        window.dispatchEvent(new Event('usuario_sesion_changed'));

        if (isSuper) {
            window.location.href = '/superadmin/login';
        } else {
            window.location.href = '/login';
        }
    }
    return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
