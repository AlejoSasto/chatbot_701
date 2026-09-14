/**
 * ==============================================================================
 * Vista del Chatbot (Renderizado y Manipulación de UI)
 * ==============================================================================
 * Controla el montaje de mensajes, indicadores de carga, scroll automático
 * y retroalimentación visual accesible (Sec. 11 y 16).
 */

import { safeMarkdownToHtml, escapeHtml } from '../utils/sanitizers.js';

export class ChatbotView {
    constructor() {
        this.container = null;
        this.messagesList = null;
        this.inputField = null;
        this.sendButton = null;
        this.clearButton = null;
        this.closeButton = null;
        this.floatingToggleBtn = null;
        this.loadingIndicator = null;
        this.quickChipsContainer = null;
    }

    /**
     * Enlaza los elementos del DOM y prepara eventos de la interfaz del chat.
     */
    init() {
        this.container = document.getElementById('chatbot-drawer');
        this.messagesList = document.getElementById('chat-messages');
        this.inputField = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send-btn');
        this.clearButton = document.getElementById('chat-clear-btn');
        this.closeButton = document.getElementById('chat-close-btn');
        this.floatingToggleBtn = document.getElementById('chatbot-floating-toggle');
        this.quickChipsContainer = document.getElementById('chat-quick-chips');

        this.setupQuickChips();
    }

    /**
     * Configura botones de sugerencias rápidas ("chips") para el usuario.
     */
    setupQuickChips() {
        if (!this.quickChipsContainer) return;
        const chips = [
            '🎵 Recomiéndame 3 canciones para programar',
            '🎸 Explica qué es el género Synthwave',
            '☕ Dame una playlist relajante de Jazz',
            '🔥 ¿Cuáles son las pistas más escuchadas?'
        ];

        this.quickChipsContainer.innerHTML = '';
        chips.forEach(text => {
            const chip = document.createElement('button');
            chip.className = 'chat-quick-chip';
            chip.type = 'button';
            chip.textContent = text;
            chip.onclick = () => {
                if (this.inputField) {
                    this.inputField.value = text.replace(/^[^\w\s]+/, '').trim();
                    this.inputField.focus();
                }
            };
            this.quickChipsContainer.appendChild(chip);
        });
    }

    /**
     * Alterna la visibilidad del panel de chat.
     */
    toggle(isOpen) {
        if (!this.container) return;
        if (isOpen) {
            this.container.classList.add('is-open');
            this.container.setAttribute('aria-hidden', 'false');
            if (this.inputField) {
                setTimeout(() => this.inputField.focus(), 300);
            }
        } else {
            this.container.classList.remove('is-open');
            this.container.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Agrega un mensaje al historial visual en el DOM.
     * @param {Object} message - { sender: 'user'|'gemini', text, timestamp }
     */
    appendMessage(message) {
        if (!this.messagesList) return;

        const li = document.createElement('li');
        const isUser = message.sender === 'user';
        li.className = `chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;

        const avatar = document.createElement('div');
        avatar.className = 'chat-bubble-avatar';
        avatar.textContent = isUser ? '👤' : '✨';
        avatar.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');
        content.className = 'chat-bubble-content';

        const senderName = document.createElement('span');
        senderName.className = 'chat-bubble-author';
        senderName.textContent = isUser ? 'Tú' : 'Gemini 2.5 Flash';

        const textDiv = document.createElement('div');
        textDiv.className = 'chat-bubble-text';

        if (isUser) {
            textDiv.textContent = message.text;
        } else {
            textDiv.innerHTML = safeMarkdownToHtml(message.text);
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'chat-bubble-time';
        timeSpan.textContent = message.timestamp || '';

        content.appendChild(senderName);
        content.appendChild(textDiv);
        content.appendChild(timeSpan);

        li.appendChild(avatar);
        li.appendChild(content);

        this.messagesList.appendChild(li);
        this.scrollToBottom();
    }

    /**
     * Renderiza todo el historial de mensajes de una sola vez (ej. al abrir o reiniciar).
     */
    renderHistory(history) {
        if (!this.messagesList) return;
        this.messagesList.innerHTML = '';
        history.forEach(msg => this.appendMessage(msg));
    }

    /**
     * Muestra u oculta el indicador de "Gemini está pensando...".
     */
    setLoading(isLoading) {
        if (this.sendButton) {
            this.sendButton.disabled = isLoading;
            this.sendButton.setAttribute('aria-busy', String(isLoading));
        }
        if (this.inputField) {
            this.inputField.disabled = isLoading;
        }

        const existingLoader = document.getElementById('chat-typing-loader');

        if (isLoading && !existingLoader) {
            const loaderLi = document.createElement('li');
            loaderLi.id = 'chat-typing-loader';
            loaderLi.className = 'chat-bubble chat-bubble-ai chat-typing';
            loaderLi.innerHTML = `
                <div class="chat-bubble-avatar" aria-hidden="true">✨</div>
                <div class="chat-bubble-content">
                    <span class="chat-bubble-author">Gemini 2.5 Flash</span>
                    <div class="typing-dots" aria-label="Gemini está componiendo una respuesta">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            this.messagesList.appendChild(loaderLi);
            this.scrollToBottom();
        } else if (!isLoading && existingLoader) {
            existingLoader.remove();
        }
    }

    /**
     * Muestra un mensaje de advertencia o validación temporal bajo el input.
     */
    showValidationError(errorText) {
        let errEl = document.getElementById('chat-validation-msg');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = 'chat-validation-msg';
            errEl.className = 'chat-validation-error';
            this.inputField.parentNode.insertBefore(errEl, this.inputField.nextSibling);
        }
        errEl.textContent = errorText;
        errEl.style.display = 'block';

        setTimeout(() => {
            if (errEl) errEl.style.display = 'none';
        }, 3500);
    }

    /**
     * Limpia el campo de entrada.
     */
    clearInput() {
        if (this.inputField) {
            this.inputField.value = '';
        }
    }

    /**
     * Desplaza suavemente la conversación hacia el último mensaje.
     */
    scrollToBottom() {
        if (this.messagesList) {
            this.messagesList.scrollTop = this.messagesList.scrollHeight;
        }
    }
}
