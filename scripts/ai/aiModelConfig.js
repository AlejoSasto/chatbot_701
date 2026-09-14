/**
 * ==============================================================================
 * Configuración del Modelo de Inteligencia Artificial
 * ==============================================================================
 * Centraliza la definición del modelo activo (Gemini 2.5 Flash), parámetros de
 * inferencia y directivas de comportamiento musical (Sec. 9.2 y 9.10).
 */

export const AI_MODEL_CONFIG = Object.freeze({
    // Nombre del modelo activo
    MODEL_NAME: 'gemini-2.5-flash',
    
    // Proveedor conceptual
    PROVIDER: 'Google Gemini / Google AI Studio',

    // Parámetros de generación de lenguaje
    GENERATION_CONFIG: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 800
    },

    // Instrucción de sistema (personalidad y restricciones de dominio)
    SYSTEM_INSTRUCTION: `Eres el Asistente Musical Inteligente de SoundWave, potenciado por Gemini 2.5 Flash.
Tu función es recomendar música, responder preguntas sobre géneros, artistas, álbumes y crear playlists conceptuales.
Directrices:
1. Mantén siempre el foco en el ámbito de la música, sonido, audio e historia musical.
2. Da respuestas concisas, entusiastas y bien formateadas con viñetas y títulos en Markdown.
3. Si el usuario pide canciones para un estado de ánimo o actividad (ej. programar, estudiar, relajarse), sugiere al menos 3 a 4 canciones con artista y género.
4. Si el usuario pregunta algo totalmente ajeno a la música o cultura sonora, recuérdale amablemente que tu especialidad es el universo musical.`
});
