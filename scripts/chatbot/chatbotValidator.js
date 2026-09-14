/**
 * ==============================================================================
 * Validador de Entradas del Chatbot
 * ==============================================================================
 * Aplica reglas de integridad antes de enviar mensajes al controlador (Sec. 8.3 y RF-07).
 */

import { isNotEmpty, isWithinLength } from '../utils/validators.js';
import { stripHtmlTags } from '../utils/sanitizers.js';

export const chatbotValidator = {
    /**
     * Valida y prepara el texto ingresado por el usuario.
     * @param {string} rawInput - Texto ingresado en el input
     * @returns {Object} { isValid: boolean, error: string|null, sanitized: string }
     */
    validate(rawInput) {
        if (!isNotEmpty(rawInput)) {
            return {
                isValid: false,
                error: 'Por favor escribe un mensaje o pregunta antes de enviar.',
                sanitized: ''
            };
        }

        const cleaned = stripHtmlTags(rawInput).trim();

        if (!isWithinLength(cleaned, 1, 500)) {
            return {
                isValid: false,
                error: 'El mensaje debe contener entre 1 y 500 caracteres.',
                sanitized: cleaned
            };
        }

        return {
            isValid: true,
            error: null,
            sanitized: cleaned
        };
    }
};
