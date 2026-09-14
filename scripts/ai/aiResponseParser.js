/**
 * ==============================================================================
 * Módulo de Interpretación y Normalización de Respuestas de IA
 * ==============================================================================
 * Valida que la respuesta de Gemini contenga datos utilizables, la sanitiza
 * y la transforma en una estructura uniforme para el chatbotView (Sec. 9.8).
 */

import { safeMarkdownToHtml } from '../utils/sanitizers.js';
import { isNotEmpty } from '../utils/validators.js';

export const aiResponseParser = {
    /**
     * Parsea y valida la respuesta recibida desde el cliente de IA o proxy.
     * @param {Object|string} rawResponse
     * @returns {Object} Respuesta estandarizada { text, html, valid: boolean, source: string }
     */
    parse(rawResponse) {
        if (!rawResponse) {
            return {
                valid: false,
                text: 'No se recibió ninguna respuesta del modelo.',
                html: '<p class="error-text">No se recibió respuesta válida del asistente.</p>',
                source: 'error'
            };
        }

        let rawText = '';
        let source = 'gemini';

        if (typeof rawResponse === 'string') {
            rawText = rawResponse;
        } else if (typeof rawResponse === 'object') {
            rawText = rawResponse.text || rawResponse.message || '';
            source = rawResponse.source || (rawResponse.model ? 'gemini-api' : 'unknown');
        }

        rawText = rawText.trim();

        if (!rawText) {
            return {
                valid: false,
                text: 'La respuesta de la IA llegó vacía.',
                html: '<p class="error-text">La respuesta llegó vacía. Por favor formula tu pregunta de otra manera.</p>',
                source: 'empty'
            };
        }

        // Renderizar Markdown seguro
        const safeHtml = safeMarkdownToHtml(rawText);

        return {
            valid: true,
            text: rawText,
            html: safeHtml,
            source: source,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
};
