/**
 * ==============================================================================
 * Módulo de Manejo Centralizado de Errores
 * ==============================================================================
 * Responsable de interceptar, clasificar y notificar errores al usuario de forma
 * amigable y segura, sin filtrar información técnica sensible (Sec. 18).
 */

import { eventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';

export const ErrorTypes = Object.freeze({
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTH_ERROR',
    RATE_LIMIT: 'RATE_LIMIT_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
    UNEXPECTED: 'UNEXPECTED_ERROR'
});

class ErrorHandler {
    constructor() {
        this.toastContainer = null;
    }

    /**
     * Inicializa el contenedor visual de notificaciones de error tipo Toast en el DOM.
     */
    init() {
        if (!this.toastContainer) {
            this.toastContainer = document.getElementById('toast-notifications');
            if (!this.toastContainer) {
                this.toastContainer = document.createElement('div');
                this.toastContainer.id = 'toast-notifications';
                this.toastContainer.className = 'toast-container';
                this.toastContainer.setAttribute('aria-live', 'assertive');
                document.body.appendChild(this.toastContainer);
            }
        }

        // Escuchar eventos de error globales emitidos en el EventBus
        eventBus.on(CONFIG.EVENTS.ERROR_OCCURRED, (errorInfo) => {
            this.handle(errorInfo);
        });

        // Captura global de errores no controlados en tiempo de ejecución
        window.addEventListener('unhandledrejection', (event) => {
            console.warn('Capturado error no manejado de promesa:', event.reason);
            this.handle({
                type: ErrorTypes.UNEXPECTED,
                originalError: event.reason,
                userMessage: 'Ocurrió un inconveniente inesperado al procesar tu solicitud.'
            });
        });
    }

    /**
     * Clasifica y procesa cualquier error.
     * @param {Object|Error} errorData
     */
    handle(errorData) {
        let type = ErrorTypes.UNEXPECTED;
        let message = 'Ha ocurrido un problema. Por favor intenta nuevamente.';

        if (typeof errorData === 'string') {
            message = errorData;
        } else if (errorData instanceof Error) {
            const raw = errorData.message.toLowerCase();
            if (raw.includes('timeout') || raw.includes('tiempo de espera')) {
                type = ErrorTypes.TIMEOUT;
                message = 'La respuesta está tardando más de lo esperado. Verifica tu conexión.';
            } else if (raw.includes('network') || raw.includes('conexión') || raw.includes('fetch')) {
                type = ErrorTypes.NETWORK;
                message = 'No fue posible conectar con el servicio. Revisa tu conexión a internet.';
            } else if (raw.includes('rate') || raw.includes('cuota') || raw.includes('limit')) {
                type = ErrorTypes.RATE_LIMIT;
                message = 'El servicio de IA está experimentando alta demanda. Intenta en un momento.';
            } else {
                message = errorData.message;
            }
        } else if (typeof errorData === 'object' && errorData !== null) {
            type = errorData.type || ErrorTypes.UNEXPECTED;
            message = errorData.userMessage || errorData.message || message;
        }

        // Registrar en consola interna para debugging (sin exponerlo en pantalla)
        console.error(`[ErrorHandler][${type}]`, errorData);

        // Mostrar notificación amigable en pantalla
        this.showToast(message, type);

        return { type, message };
    }

    /**
     * Muestra una notificación emergente accesible en la interfaz.
     * @param {string} message - Mensaje amigable
     * @param {string} type - Tipo de error
     */
    showToast(message, type = 'default') {
        if (!this.toastContainer) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type.toLowerCase()}`;
        toast.setAttribute('role', 'alert');

        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = '⚠️';

        const text = document.createElement('span');
        text.className = 'toast-message';
        text.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Cerrar notificación');
        closeBtn.onclick = () => toast.remove();

        toast.appendChild(icon);
        toast.appendChild(text);
        toast.appendChild(closeBtn);

        this.toastContainer.appendChild(toast);

        // Auto remover tras 4.5 segundos
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }
}

export const errorHandler = new ErrorHandler();
