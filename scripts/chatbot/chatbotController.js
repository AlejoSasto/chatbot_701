/**
 * ==============================================================================
 * Controlador del Chatbot (Orquestación del Flujo de Conversación)
 * ==============================================================================
 * Conecta la vista del chatbot con el estado de la aplicación, el validador
 * y el cliente de IA Gemini 2.5 Flash (Sec. 8.3 y 8.4).
 */

import { appState } from '../core/appState.js';
import { eventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';
import { chatbotValidator } from './chatbotValidator.js';
import { geminiClient } from '../ai/geminiClient.js';
import { errorHandler, ErrorTypes } from '../errors/errorHandler.js';

export class ChatbotController {
    constructor(view) {
        this.view = view;
    }

    /**
     * Inicializa la suscripción a eventos y vinculación de controles.
     */
    init() {
        this.view.init();

        // Renderizar historial inicial
        this.view.renderHistory(appState.getChatHistory());

        // Suscribirse a cambios de estado vía EventBus
        eventBus.on(CONFIG.EVENTS.CHAT_OPEN, () => this.view.toggle(true));
        eventBus.on(CONFIG.EVENTS.CHAT_CLOSE, () => this.view.toggle(false));
        eventBus.on(CONFIG.EVENTS.CHAT_LOADING_CHANGED, ({ isLoading }) => this.view.setLoading(isLoading));
        eventBus.on(CONFIG.EVENTS.CHAT_MESSAGE_SENT, (msg) => this.view.appendMessage(msg));
        eventBus.on(CONFIG.EVENTS.CHAT_MESSAGE_RECEIVED, (msg) => this.view.appendMessage(msg));
        eventBus.on(CONFIG.EVENTS.CHAT_CLEARED, () => this.view.renderHistory(appState.getChatHistory()));

        this.bindEvents();
    }

    /**
     * Enlaza eventos de interacción del usuario (envío, teclado, botones).
     */
    bindEvents() {
        const form = document.getElementById('chat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSendMessage();
            });
        }

        // Enter para enviar (Shift+Enter para salto de línea si fuera textarea)
        if (this.view.inputField) {
            this.view.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }

        // Botón limpiar historial
        if (this.view.clearButton) {
            this.view.clearButton.addEventListener('click', () => {
                if (confirm('¿Deseas reiniciar la conversación con Gemini?')) {
                    appState.clearChatHistory();
                }
            });
        }

        // Botón cerrar drawer
        if (this.view.closeButton) {
            this.view.closeButton.addEventListener('click', () => {
                appState.setChatOpen(false);
            });
        }

        // Botón flotante para abrir/cerrar
        if (this.view.floatingToggleBtn) {
            this.view.floatingToggleBtn.addEventListener('click', () => {
                appState.setChatOpen(!appState.isChatOpen());
            });
        }

        // Atajo de teclado: Escape cierra el chat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && appState.isChatOpen()) {
                appState.setChatOpen(false);
            }
        });
    }

    /**
     * Procesa el ciclo completo de envío de un mensaje.
     */
    async handleSendMessage() {
        if (appState.isChatLoading()) return;

        const rawValue = this.view.inputField?.value || '';
        const validation = chatbotValidator.validate(rawValue);

        if (!validation.isValid) {
            this.view.showValidationError(validation.error);
            return;
        }

        const userText = validation.sanitized;
        this.view.clearInput();

        // 1. Registrar mensaje del usuario en el estado
        appState.addChatMessage({
            sender: 'user',
            text: userText
        });

        // 2. Activar estado de carga
        appState.setChatLoading(true);

        try {
            // 3. Consultar cliente Gemini con historial reciente
            const history = appState.getChatHistory().slice(-8);
            const response = await geminiClient.sendMessage(userText, history);

            // 4. Agregar respuesta al estado
            appState.addChatMessage({
                sender: 'gemini',
                text: response.text,
                source: response.source
            });

        } catch (err) {
            console.error('Error al procesar mensaje con IA:', err);
            errorHandler.handle({
                type: ErrorTypes.UNEXPECTED,
                message: 'No fue posible completar la consulta con Gemini. Intenta de nuevo.'
            });

            appState.addChatMessage({
                sender: 'gemini',
                text: '⚠️ Hubo una interrupción al generar la respuesta. Por favor verifica tu conexión o intenta reformular la pregunta.'
            });
        } finally {
            // 5. Desactivar estado de carga
            appState.setChatLoading(false);
        }
    }
}
