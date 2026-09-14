/**
 * ==============================================================================
 * Módulo de Estado Global de la Aplicación (Single Source of Truth)
 * ==============================================================================
 * Conforme a la Sección 14 del plan técnico, todo el estado compartido de la app
 * reside en este módulo, manipulado únicamente mediante mutadores controlados y
 * comunicando los cambios reactivamente mediante eventBus.
 */

import { eventBus } from './eventBus.js';
import { CONFIG } from './config.js';

class AppState {
    constructor() {
        // Estado privado encapsulado
        this._state = {
            // Reproductor
            currentTrack: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: CONFIG.PLAYER.DEFAULT_VOLUME,
            isMuted: false,

            // Navegación
            activeSection: 'inicio',
            searchQuery: '',

            // Chatbot
            isChatOpen: false,
            isChatLoading: false,
            chatHistory: [
                {
                    id: 'welcome-msg',
                    sender: 'gemini',
                    text: '¡Hola! 🎵 Soy tu asistente musical inteligente impulsado por **Gemini 2.5 Flash**. ¿En qué puedo ayudarte hoy?\n\nPuedes pedirme recomendaciones de canciones, listas para estudiar o entrenar, datos sobre artistas o análisis de géneros.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ],

            // Colecciones del usuario (Favoritos)
            favorites: new Set([1, 4, 7]) // Canciones favoritas de muestra
        };
    }

    // --- Getters de solo lectura ---

    getCurrentTrack() {
        return this._state.currentTrack ? { ...this._state.currentTrack } : null;
    }

    isPlaying() {
        return this._state.isPlaying;
    }

    getCurrentTime() {
        return this._state.currentTime;
    }

    getDuration() {
        return this._state.duration;
    }

    getVolume() {
        return this._state.volume;
    }

    isMuted() {
        return this._state.isMuted;
    }

    getActiveSection() {
        return this._state.activeSection;
    }

    getSearchQuery() {
        return this._state.searchQuery;
    }

    isChatOpen() {
        return this._state.isChatOpen;
    }

    isChatLoading() {
        return this._state.isChatLoading;
    }

    getChatHistory() {
        return [...this._state.chatHistory];
    }

    isFavorite(songId) {
        return this._state.favorites.has(songId);
    }

    getFavorites() {
        return Array.from(this._state.favorites);
    }

    // --- Mutadores de Estado Controlados ---

    /**
     * Establece la canción activa y opcionalmente inicia reproducción.
     */
    setCurrentTrack(track, autoplay = true) {
        if (!track) return;
        this._state.currentTrack = track;
        this._state.duration = track.duration || 180;
        this._state.currentTime = 0;
        this._state.isPlaying = autoplay;

        eventBus.emit(CONFIG.EVENTS.TRACK_CHANGE, { track, isPlaying: this._state.isPlaying });
    }

    /**
     * Alterna o fuerza el estado de reproducción.
     */
    setPlaying(playing) {
        this._state.isPlaying = Boolean(playing);
        if (this._state.isPlaying) {
            eventBus.emit(CONFIG.EVENTS.TRACK_PLAY, this._state.currentTrack);
        } else {
            eventBus.emit(CONFIG.EVENTS.TRACK_PAUSE, this._state.currentTrack);
        }
    }

    /**
     * Actualiza el progreso actual de tiempo de la pista en reproducción.
     */
    setProgress(currentTime, duration = null) {
        this._state.currentTime = Math.max(0, currentTime);
        if (duration !== null) {
            this._state.duration = duration;
        }
        eventBus.emit(CONFIG.EVENTS.PROGRESS_UPDATE, {
            currentTime: this._state.currentTime,
            duration: this._state.duration
        });
    }

    /**
     * Modifica el volumen global (0.0 a 1.0).
     */
    setVolume(vol) {
        const clamped = Math.max(0, Math.min(1, vol));
        this._state.volume = clamped;
        this._state.isMuted = clamped === 0;
        eventBus.emit(CONFIG.EVENTS.VOLUME_CHANGE, { volume: clamped, isMuted: this._state.isMuted });
    }

    /**
     * Alterna mute.
     */
    toggleMute() {
        this._state.isMuted = !this._state.isMuted;
        eventBus.emit(CONFIG.EVENTS.VOLUME_CHANGE, {
            volume: this._state.isMuted ? 0 : this._state.volume,
            isMuted: this._state.isMuted
        });
    }

    /**
     * Actualiza la sección activa de la vista.
     */
    setActiveSection(sectionName) {
        if (this._state.activeSection === sectionName) return;
        this._state.activeSection = sectionName;
        eventBus.emit(CONFIG.EVENTS.NAVIGATE, { section: sectionName });
    }

    /**
     * Actualiza la consulta de búsqueda.
     */
    setSearchQuery(query) {
        this._state.searchQuery = query || '';
    }

    /**
     * Abre o cierra el chatbot.
     */
    setChatOpen(isOpen) {
        this._state.isChatOpen = Boolean(isOpen);
        if (this._state.isChatOpen) {
            eventBus.emit(CONFIG.EVENTS.CHAT_OPEN);
        } else {
            eventBus.emit(CONFIG.EVENTS.CHAT_CLOSE);
        }
    }

    /**
     * Define si el chatbot está esperando respuesta de Gemini.
     */
    setChatLoading(isLoading) {
        this._state.isChatLoading = Boolean(isLoading);
        eventBus.emit(CONFIG.EVENTS.CHAT_LOADING_CHANGED, { isLoading: this._state.isChatLoading });
    }

    /**
     * Agrega un mensaje al historial de chat.
     */
    addChatMessage(message) {
        const fullMsg = {
            id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            sender: message.sender || 'user',
            text: message.text || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...message
        };

        this._state.chatHistory.push(fullMsg);
        
        if (fullMsg.sender === 'user') {
            eventBus.emit(CONFIG.EVENTS.CHAT_MESSAGE_SENT, fullMsg);
        } else {
            eventBus.emit(CONFIG.EVENTS.CHAT_MESSAGE_RECEIVED, fullMsg);
        }

        return fullMsg;
    }

    /**
     * Limpia la conversación y reinicia el mensaje de bienvenida.
     */
    clearChatHistory() {
        this._state.chatHistory = [
            {
                id: 'welcome-msg-' + Date.now(),
                sender: 'gemini',
                text: 'Conversación reiniciada. ✨ ¿Sobre qué artista, género o canción quieres explorar ahora?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];
        eventBus.emit(CONFIG.EVENTS.CHAT_CLEARED);
    }

    /**
     * Alterna el estado de favorito de una canción.
     */
    toggleFavorite(songId) {
        if (this._state.favorites.has(songId)) {
            this._state.favorites.delete(songId);
        } else {
            this._state.favorites.add(songId);
        }
    }
}

export const appState = new AppState();
