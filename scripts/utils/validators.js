/**
 * ==============================================================================
 * Módulo de Validadores Reutilizables
 * ==============================================================================
 * Funciones puras para verificar integridad de datos ingresados por el usuario.
 */

/**
 * Verifica si un texto no está vacío ni compuesto únicamente de espacios.
 * @param {string} text 
 * @returns {boolean}
 */
export function isNotEmpty(text) {
    return typeof text === 'string' && text.trim().length > 0;
}

/**
 * Valida si un texto cumple con un rango de longitud.
 * @param {string} text 
 * @param {number} min 
 * @param {number} max 
 * @returns {boolean}
 */
export function isWithinLength(text, min = 1, max = 500) {
    if (typeof text !== 'string') return false;
    const len = text.trim().length;
    return len >= min && len <= max;
}

/**
 * Valida si una URL parece válida para imágenes o recursos.
 * @param {string} urlString 
 * @returns {boolean}
 */
export function isValidUrl(urlString) {
    if (typeof urlString !== 'string') return false;
    try {
        new URL(urlString, window.location.origin);
        return true;
    } catch (_) {
        return false;
    }
}
