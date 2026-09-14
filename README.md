# 🎵 SoundWave Music App — con Chatbot Gemini 2.5 Flash

Aplicativo web de música inspirado en las plataformas de streaming modernas, construido desde cero con **HTML5 semántico, CSS3 moderno y Vanilla JavaScript (ES Modules)**, complementado con un backend proxy en Node.js para salvaguardar la API Key y comunicarse de forma segura con **Gemini 2.5 Flash** (Google AI Studio).

---

## 🌟 Características Principales

- **Streaming & Catálogo Musical**:
  - Navegación fluida tipo SPA entre 8 secciones: *Inicio, Buscar, Biblioteca, Favoritos, Playlists, Artistas, Álbumes y Chatbot*.
  - Búsqueda en tiempo real de canciones, artistas, álbumes y etiquetas de género musical.
  - Reproductor persistente inferior interactivo con carátula, controles Play/Pause, Anterior/Siguiente, barra de progreso con seek y control de volumen.
  - Gestión reactiva de canciones favoritas con persistencia en el estado de sesión.

- **Chatbot Inteligente con Gemini 2.5 Flash**:
  - Especializado en recomendaciones de canciones, análisis de álbumes, creación de playlists para estudio/entrenamiento y trivia de artistas.
  - Panel deslizante lateral (*drawer*) y acceso rápido mediante botón flotante o menú principal.
  - Sugerencias rápidas ("chips" de un solo clic) para iniciar conversaciones.
  - Indicador de mecanografiado animado mientras Gemini procesa la respuesta.
  - Formateo enriquecido con Markdown seguro y sanitización estricta contra ataques XSS.
  - Opción de reiniciar y limpiar el historial de conversación en cualquier momento.

- **Arquitectura de Software y Seguridad**:
  - Arquitectura modular limpia por capas (`core`, `navigation`, `player`, `chatbot`, `ai`, `data`, `errors`, `utils`).
  - Patrón *Publish/Subscribe* mediante `eventBus.js` y única fuente de verdad con `appState.js`.
  - **Cero exposición de credenciales**: la API Key reside exclusivamente en el archivo `.env` del servidor local `server.js`.
  - Modo demostración y contingencia inteligente que permite utilizar toda la aplicación de inmediato aun si no se cuenta con una API key configurada.
  - Manejador centralizado de errores con notificaciones tipo *Toast* accesibles.
  - Totalmente responsive para computadoras de escritorio, tablets y teléfonos móviles.

---

## 📁 Estructura del Proyecto

```
chatbot/
├── .env.example                               # Plantilla de variables de entorno
├── .env                                       # Configuración local de entorno (ignorado en Git)
├── .gitignore                                 # Exclusiones de Git
├── README.md                                  # Guía del proyecto
├── server.js                                  # Servidor HTTP y Backend Proxy Seguro para Gemini
├── index.html                                 # Estructura semántica base SPA
├── assets/                                    # Recursos gráficos y multimedia
├── styles/
│   ├── variables.css                          # Tokens de diseño y paleta oscura
│   ├── base.css                               # Reset, tipografía y notificaciones toast
│   ├── layout.css                             # Disposición de cuadrícula y hero banner
│   ├── navigation.css                         # Barra lateral y menús
│   ├── player.css                             # Reproductor inferior persistente
│   ├── chatbot.css                            # Panel y burbujas del chatbot
│   ├── cards.css                              # Tarjetas de música, álbumes y artistas
│   └── responsive.css                         # Adaptación desktop, tablet y móvil
├── scripts/
│   ├── core/
│   │   ├── appState.js                        # Estado reactivo global
│   │   ├── eventBus.js                        # Bus de eventos desacoplado
│   │   └── config.js                          # Configuración no sensible del frontend
│   ├── navigation/
│   │   └── navigationController.js            # Controlador de vistas y secciones SPA
│   ├── player/
│   │   ├── playerController.js                # Lógica del reproductor y avance temporal
│   │   └── playerView.js                      # Manipulación visual del reproductor
│   ├── chatbot/
│   │   ├── chatbotValidator.js                # Validación de entradas del usuario
│   │   ├── chatbotView.js                     # Render de mensajes y animaciones
│   │   └── chatbotController.js               # Orquestador del flujo conversacional
│   ├── ai/
│   │   ├── aiModelConfig.js                   # Parámetros y prompt musical de Gemini 2.5 Flash
│   │   ├── aiResponseParser.js                # Normalización y render de Markdown seguro
│   │   └── geminiClient.js                    # Cliente de IA y gestión de contingencia
│   ├── data/
│   │   ├── songsRepository.js                 # Catálogo de canciones
│   │   ├── artistsRepository.js               # Datos de artistas
│   │   ├── albumsRepository.js                # Catálogo de álbumes
│   │   └── playlistsRepository.js             # Playlists sugeridas
│   ├── errors/
│   │   └── errorHandler.js                    # Manejador centralizado de errores
│   ├── utils/
│   │   ├── validators.js                      # Validaciones reutilizables
│   │   ├── formatters.js                      # Formato de tiempos (mm:ss) y texto
│   │   └── sanitizers.js                      # Prevención de XSS y escape HTML
│   └── main.js                                # Entrypoint y bootstrap de la app
└── docs/
    └── arquitectura.md                        # Documento técnico detallado de arquitectura
```

---

## 🚀 Puesta en Marcha Rápida

### Requisitos
- Node.js instalado (versión 18 o superior). No se requieren paquetes externos vía `npm install`.

### Paso 1: Configurar la API Key de Gemini (Opcional)
Abre el archivo `.env` en la raíz del proyecto y coloca tu clave de API de **Google AI Studio**:

```env
GEMINI_API_KEY=tu_clave_real_de_gemini
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
```

> 💡 *Nota*: Si dejas la clave por defecto o no la configuras, la aplicación funcionará de manera automática en **Modo Demostración Musical Inteligente**, respondiendo a tus preguntas sobre géneros, recomendaciones y playlists.

### Paso 2: Iniciar el Servidor
Ejecuta en tu terminal:

```bash
node server.js
```

### Paso 3: Abrir en el Navegador
Visita en cualquier navegador moderno:
👉 **`http://localhost:3001`**

---

## ⌨️ Atajos de Teclado y Accesibilidad

| Tecla | Acción |
|---|---|
| `Espacio` | Alternar Reproducción / Pausa de la canción activa. |
| `Ctrl` + `Flecha Derecha` | Avanzar a la siguiente canción del catálogo. |
| `Ctrl` + `Flecha Izquierda` | Retroceder a la canción anterior. |
| `Escape` | Cerrar el panel del Chatbot. |
| `Enter` (en el chat) | Enviar consulta a Gemini. |
| `Tab` | Navegación accesible completa con resaltado visible de foco. |

---

## 🔒 Modelo de Seguridad Aplicado

1. **Credenciales Ocultas**: El código fuente en `/scripts` no contiene ninguna clave de API ni secreto.
2. **Backend Proxy**: Las peticiones a Google Gemini se originan desde `server.js` del lado del servidor, inyectando la credencial protegida.
3. **Git Hygiene**: El archivo `.env` está expresamente excluido en `.gitignore`.
4. **Sanitización XSS**: Todo el contenido dinámico retornado por la IA o escrito por el usuario pasa por `escapeHtml` y filtros antes de ser montado en el DOM.
5. **Timeouts y Control de Aborto**: Las consultas a la IA tienen un tiempo límite configurado (`REQUEST_TIMEOUT_MS: 15000`) para evitar bloqueos por latencia de red.

---

## 📚 Documentación Adicional
Para consultar diagramas de secuencia detallados, responsabilidades de cada módulo y cumplimiento de la especificación técnica, revisa [docs/arquitectura.md](docs/arquitectura.md).
