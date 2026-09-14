/**
 * ==============================================================================
 * Módulo de Configuración Pública de la Aplicación
 * ==============================================================================
 * Centraliza parámetros no sensibles y endpoints accesibles para el frontend.
 * Conforme al requerimiento RNF-04 y Sección 9.4 del plan técnico, este archivo
 * NUNCA almacena API keys ni credenciales sensibles.
 */

export const CONFIG = Object.freeze({
    // Nombre e identidad del aplicativo
    APP_NAME: 'SoundWave Music',
    VERSION: '1.0.0',

    // Endpoints del backend intermedio / proxy local
    ENDPOINTS: {
        CHAT: '/api/chat',
        CONFIG: '/api/config'
    },

    // Parámetros de la Inteligencia Artificial
    AI: {
        DEFAULT_MODEL: 'gemini-2.5-flash',
        MAX_PROMPT_LENGTH: 500,
        TIMEOUT_MS: 15000
    },

    // Preferencias de UI y Reproductor
    PLAYER: {
        DEFAULT_VOLUME: 0.75,
        SEEK_STEP_SECONDS: 5
    },

    // Constantes de eventos del sistema (para evitar errores tipográficos en EventBus)
    EVENTS: {
        NAVIGATE: 'nav:section_changed',
        TRACK_PLAY: 'player:play',
        TRACK_PAUSE: 'player:pause',
        TRACK_CHANGE: 'player:track_changed',
        VOLUME_CHANGE: 'player:volume_changed',
        PROGRESS_UPDATE: 'player:progress_update',
        CHAT_OPEN: 'chat:open',
        CHAT_CLOSE: 'chat:close',
        CHAT_MESSAGE_SENT: 'chat:message_sent',
        CHAT_MESSAGE_RECEIVED: 'chat:message_received',
        CHAT_LOADING_CHANGED: 'chat:loading_changed',
        CHAT_CLEARED: 'chat:cleared',
        ERROR_OCCURRED: 'system:error'
    }
});
