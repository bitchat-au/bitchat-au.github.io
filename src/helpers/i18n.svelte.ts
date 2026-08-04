import danishTranslations from '../i18n/da.json'
import englishTranslations from '../i18n/en.json'

const availableTranslations = {
    da: flattenTranslations(danishTranslations),
    en: flattenTranslations(englishTranslations),
    ...(
        import.meta.env.DEV && {
            null: {} // Dev mode to check translation keys
        }
    )
}

export const availableLocales = Object.keys(availableTranslations) as Array<keyof typeof availableTranslations>;

type AvailableLocales = keyof typeof availableTranslations;
type Translations = typeof danishTranslations;

/**
 * Loads the translations for the specified locale
 * @param locale The locale to load translations for
 * @returns A flat object containing the translations for the specified locale
 */
const loadTranslations = (locale: AvailableLocales): Record<string, string> => {
    if (!(locale in availableTranslations)) {
        throw new Error(`Translations for locale '${locale}' not found`);
    }
    
    return availableTranslations[locale] || {};
}

/**
 * Flattens the nested translation keys to a flat structure
 * @param translations The translations object to flatten
 * @returns A flat object with dot-separated keys
 */
function flattenTranslations(translations: Translations): Record<string, string> {
    const remapped: Record<string, string> = {};
    const recurse = (obj: any, prefix: string = '') => {
        for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                recurse(value, newKey);
            } else {
                remapped[newKey] = value;
            }
        }
    };
    recurse(translations);
    return remapped;
}

const storageKey = 'bit:chat-locale';
function getLocale(): AvailableLocales {
    // Check for locale in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const localeParam = urlParams.get('locale');

    // Check for locale in localStorage
    const storedLocale = localStorage.getItem(storageKey);

    // Check for locale in navigator.language
    const navigatorLocale = navigator.language.split('-')[0];

    const locale = storedLocale || localeParam || navigatorLocale || 'da';

    if (!(locale in availableTranslations)) {
        console.warn(`Locale '${locale}' not found. Falling back to 'da'.`);
        localStorage.setItem(storageKey, 'da');
        return 'da';
    }

    // Store the locale in localStorage for future visits
    localStorage.setItem(storageKey, locale);

    return locale as AvailableLocales;
}

export const locale = getLocale();
const translations = loadTranslations(locale);
export function t(path: string | string[], variables?: Record<string, string | number>): string {
    const translationKey = Array.isArray(path) ? path.join('.') : path;
    let translation = translations[translationKey] || translationKey;
    if (variables) {
        translation = Object.entries(variables).reduce((acc, [varName, varValue]) => {
            return acc.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), String(varValue));
        }, translation);
    }

    return translation;
}

export function scope(prefix: string): typeof t {
    return (path: string | string[], variables?: Record<string, string | number>) => {
        const scopedKey = `${prefix}.${Array.isArray(path) ? path.join('.') : path}`;
        return t(scopedKey, variables);
    };
}

export function changeLocale(newLocale: AvailableLocales): void {
    if (!(newLocale in availableTranslations)) {
        throw new Error(`Translations for locale '${newLocale}' not found`);
    }

    localStorage.setItem(storageKey, newLocale);
    window.location.reload();
}