/**
 * ==============================================================================
 * Punto de Entrada Principal (Main Application Bootstrap)
 * ==============================================================================
 * Inicializa todos los módulos, controladores, vistas y suscripciones del sistema.
 */

import { errorHandler } from './errors/errorHandler.js';
import { appState } from './core/appState.js';
import { CONFIG } from './core/config.js';
import { NavigationController } from './navigation/navigationController.js';
import { PlayerView } from './player/playerView.js';
import { PlayerController } from './player/playerController.js';
import { ChatbotView } from './chatbot/chatbotView.js';
import { ChatbotController } from './chatbot/chatbotController.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log(`🎵 Inicializando ${CONFIG.APP_NAME} v${CONFIG.VERSION}...`);

    try {
        // 1. Inicializar sistema centralizado de errores
        errorHandler.init();

        // 2. Inicializar controlador y vista del Reproductor persistente
        const playerView = new PlayerView();
        const playerController = new PlayerController(playerView);
        playerController.init();

        // 3. Inicializar controlador y vista del Chatbot con Gemini 2.5 Flash
        const chatbotView = new ChatbotView();
        const chatbotController = new ChatbotController(chatbotView);
        chatbotController.init();

        // 4. Inicializar controlador de navegación y renderizado de vistas SPA
        const navigationController = new NavigationController();
        navigationController.init();

        // 5. Verificar estado de conexión con el backend proxy de IA
        checkBackendStatus();

        // 6. Configurar accesibilidad global y atajos de teclado
        setupGlobalAccessibility();

        console.log('✅ Aplicación SoundWave cargada exitosamente.');

    } catch (err) {
        console.error('Error fatal durante la inicialización de la aplicación:', err);
        errorHandler.handle(err);
    }
});

/**
 * Consulta de forma no intrusiva el estado del backend proxy para informar al usuario.
 */
async function checkBackendStatus() {
    try {
        const res = await fetch(CONFIG.ENDPOINTS.CONFIG);
        if (res.ok) {
            const data = await res.json();
            console.log('ℹ️ Estado del Proxy Gemini:', data);
            const statusIndicator = document.getElementById('ai-status-badge');
            if (statusIndicator) {
                statusIndicator.title = data.hasApiKey 
                    ? 'Gemini 2.5 Flash Activo (Conectado)' 
                    : 'Modo Asistente Musical Demo Activo';
                statusIndicator.classList.toggle('status-live', data.hasApiKey);
            }
        }
    } catch (_) {
        console.log('ℹ️ Backend proxy no detectado en localhost. Operando en modo frontend cliente con contingencia.');
    }
}

/**
 * Configura mejoras de accesibilidad global para el usuario (teclado, focus trapping).
 */
function setupGlobalAccessibility() {
    // Manejo de foco visible para usuarios de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });
}
