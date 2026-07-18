import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationES from './es/translation.json';

const resources = {
    es: {
        translation: translationES
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'es', // idioma por defecto (Español)
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false // react ya protege de xss
        }
    });

export default i18n;
