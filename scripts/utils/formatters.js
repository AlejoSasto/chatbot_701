/**
 * ==============================================================================
 * Módulo de Formateo y Transformación de Datos
 * ==============================================================================
 * Centraliza funciones de presentación para tiempos, números y textos.
 */

/**
 * Convierte una cantidad de segundos a formato "mm:ss".
 * @param {number} totalSeconds - Segundos a convertir
 * @returns {string} Cadena en formato "03:45"
 */
export function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mins}:${formattedSecs}`;
}

/**
 * Trunca un texto si excede la longitud especificada, agregando elipsis.
 * @param {string} text - Texto original
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formatea cantidades de oyentes o reproducciones (ej. 1500000 -> 1.5M).
 * @param {number} num - Número a formatear
 * @returns {string}
 */
export function formatNumber(num) {
    if (isNaN(num)) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

/**
 * Retorna la hora actual en formato de 12 horas con indicador am/pm para mensajes de chat.
 * @returns {string} "10:30 PM"
 */
export function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
