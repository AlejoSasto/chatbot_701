/**
 * ==============================================================================
 * Cliente de Integración con Gemini 2.5 Flash
 * ==============================================================================
 * Único punto autorizado en el frontend para despachar consultas a la capa de IA.
 * Se comunica con el backend proxy intermedio (/api/chat) para no exponer la API key (Sec. 9.1 y 9.3).
 * Incluye gestión de timeouts, abort controller y contingencia inteligente.
 */

import { CONFIG } from '../core/config.js';
import { AI_MODEL_CONFIG } from './aiModelConfig.js';
import { aiResponseParser } from './aiResponseParser.js';
import { errorHandler, ErrorTypes } from '../errors/errorHandler.js';

export const geminiClient = {
    /**
     * Envía un mensaje a Gemini a través del proxy seguro.
     * @param {string} prompt - Mensaje validado del usuario
     * @param {Array} history - Historial de mensajes previos
     * @returns {Promise<Object>} Respuesta normalizada del parser
     */
    async sendMessage(prompt, history = []) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, CONFIG.AI.TIMEOUT_MS);

        try {
            const response = await fetch(CONFIG.ENDPOINTS.CHAT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    history,
                    model: AI_MODEL_CONFIG.MODEL_NAME
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMsg = `Error HTTP ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch (_) {}

                if (response.status === 429) {
                    throw { type: ErrorTypes.RATE_LIMIT, message: 'La cuota de solicitudes de Gemini ha llegado al límite. Espera un momento.' };
                } else if (response.status === 401 || response.status === 403) {
                    throw { type: ErrorTypes.AUTH, message: 'Credencial de API no autorizada en el servidor intermedio.' };
                } else {
                    throw { type: ErrorTypes.NETWORK, message: errorMsg };
                }
            }

            const data = await response.json();
            return aiResponseParser.parse(data);

        } catch (err) {
            clearTimeout(timeoutId);

            // Manejo de timeout o cancelación
            if (err.name === 'AbortError') {
                const timeoutError = {
                    type: ErrorTypes.TIMEOUT,
                    message: 'La solicitud a Gemini tardó demasiado y fue cancelada por seguridad.'
                };
                errorHandler.handle(timeoutError);
                return aiResponseParser.parse({
                    valid: false,
                    text: 'Tiempo de espera agotado al conectar con el asistente de IA. ¿Deseas reintentar?'
                });
            }

            // Si el backend intermedio no estuviera disponible (ej. si se abre con LiveServer o file://)
            // activamos el generador de contingencia musical para mantener la app viva
            console.warn('⚠️ No fue posible conectar con el proxy /api/chat. Utilizando generador musical local:', err.message);
            
            const fallbackReply = this.generateLocalMusicRecommendation(prompt);
            return aiResponseParser.parse({
                text: fallbackReply,
                source: 'local-contingency-engine'
            });
        }
    },

    /**
     * Generador musical de contingencia cuando no hay conexión con el backend proxy.
     * Garantiza que la interfaz siempre responda al usuario con datos musicales contextuales.
     */
    generateLocalMusicRecommendation(query) {
        const q = query.toLowerCase();
        if (q.includes('rock')) {
            return `🎸 **Recomendaciones de Rock (Modo Contingencia)**:
- **"Velvet Thunder"** — The Midnight Riders (*Desert Highway*)
- **"Bohemian Rhapsody"** — Queen
- **"Everlong"** — Foo Fighters

Energía, riffs memorables y baterías potentes para tu sesión.`;
        }
        if (q.includes('estudiar') || q.includes('focus') || q.includes('dormir') || q.includes('lofi') || q.includes('lo-fi')) {
            return `☕ **Selección Focus & Chill**:
- **"Echoes in the Rain"** — Komorebi (*Lo-Fi Chillscapes*)
- **"Midnight Horizons"** — Neon Echoes
- **"Solar Eclipse"** — Aetheria

Sonidos sutiles para maximizar la concentración sin distracciones.`;
        }
        return `🎵 **Asistente Musical SoundWave (Gemini 2.5 Flash)**:
Te sugiero explorar nuestra sección de **Descubrimiento Semanal** o activar la pista *"Midnight Horizons"* de Neon Echoes en la barra inferior. 

Para activar respuestas completas en tiempo real con Gemini 2.5 Flash, asegúrate de ejecutar \`node server.js\` con tu clave de API configurada.`;
    }
};
