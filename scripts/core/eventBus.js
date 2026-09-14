/**
 * ==============================================================================
 * Módulo de Event Bus (Patrón Publicador / Suscriptor)
 * ==============================================================================
 * Permite la comunicación desacoplada y asíncrona entre módulos (UI, Player,
 * Chatbot, Navegación, Errores) sin generar dependencias directas entre ellos.
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Suscribe un callback a un evento específico.
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar al emitirse
     * @returns {Function} Función desuscriptora
     */
    on(event, callback) {
        if (typeof callback !== 'function') return () => {};
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    /**
     * Elimina un callback suscrito a un evento.
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Callback a remover
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const eventSet = this.listeners.get(event);
        eventSet.delete(callback);
        if (eventSet.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Emite un evento enviando datos a todos los oyentes registrados.
     * @param {string} event - Nombre del evento
     * @param {*} data - Información transmitida
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        const callbacks = Array.from(this.listeners.get(event));
        for (const cb of callbacks) {
            try {
                cb(data);
            } catch (err) {
                console.error(`Error en listener del evento "${event}":`, err);
            }
        }
    }

    /**
     * Suscribe un callback que se ejecutará una sola vez y se auto-desuscribirá.
     * @param {string} event 
     * @param {Function} callback 
     */
    once(event, callback) {
        const off = this.on(event, (data) => {
            off();
            callback(data);
        });
        return off;
    }
}

// Exportamos una instancia singleton para toda la aplicación
export const eventBus = new EventBus();
