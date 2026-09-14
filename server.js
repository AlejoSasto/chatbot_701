/**
 * ==============================================================================
 * Servidor HTTP & Proxy Backend Seguro — Aplicación de Música & Gemini 2.5 Flash
 * ==============================================================================
 * Este servidor nativo en Node.js cumple dos funciones esenciales:
 * 1. Servir los archivos estáticos de la aplicación (HTML, CSS, JS módulos ES, assets).
 * 2. Actuar como Backend Intermedio / Proxy Seguro para comunicarse con Google Gemini,
 *    garantizando que la API Key NUNCA sea expuesta al cliente web (RNF-04 y Sec. 9.6).
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// --- 1. Carga básica de variables de entorno desde .env sin dependencias externas ---
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmed.slice(0, eqIndex).trim();
                const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    } catch (err) {
        console.warn('⚠️ No se pudo leer el archivo .env:', err.message);
    }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3001', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

// --- 2. Tipos MIME soportados para servir archivos estáticos ---
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.md': 'text/markdown; charset=UTF-8'
};

// --- 3. Generador de respuestas musicales de respaldo (Demo/Offline) ---
function generateFallbackResponse(userPrompt) {
    const promptLower = userPrompt.toLowerCase();
    
    if (promptLower.includes('recomiend') || promptLower.includes('cancion') || promptLower.includes('canción')) {
        return `🎶 **Recomendaciones Musicales Personalizadas** (Gemini 2.5 Flash Demo):
1. **"Midnight City"** — M83 (*Synthwave / Indie Pop*): Atmósfera cinematográfica y sintetizadores envolventes.
2. **"Fluorescent Adolescent"** — Arctic Monkeys (*Indie Rock*): Energía rítmica y guitarras vibrantes.
3. **"Starboy"** — The Weeknd ft. Daft Punk (*R&B / Electro*): Bajos profundos y producción impecable.

💡 *Consejo*: Puedes reproducir canciones directamente en la barra inferior o buscar artistas en la pestaña **Buscar**.`;
    }
    
    if (promptLower.includes('playlist') || promptLower.includes('lista') || promptLower.includes('estudiar') || promptLower.includes('dormir')) {
        return `🎧 **Playlist Conceptual Sugerida: "Deep Focus & Flow"**:
- **"Weightless"** — Marconi Union (*Ambient / Relax*)
- **"Daylight"** — Rêveur (*Chill Lo-Fi*)
- **"Solar Drift"** — Neon Wave (*Synthwave Instrumental*)
- **"Clair de Lune"** — Claude Debussy (*Clásica Moderna*)

Ideal para sesiones de concentración, programación y lectura continua.`;
    }
    
    if (promptLower.includes('rock') || promptLower.includes('pop') || promptLower.includes('jazz') || promptLower.includes('electronica') || promptLower.includes('electrónica')) {
        return `🎸 **Explorando Géneros Musicales**:
La música trasciende etiquetas. Por ejemplo, en **Jazz contemporáneo** destacan artistas como *Kamasi Washington* y *Nubya Garcia*; mientras que en la **electrónica actual**, productores como *Bicep* y *Fred again..* combinan nostalgia melódica con ritmos contundentes.

¿Deseas profundizar en algún artista o época específica?`;
    }
    
    return `✨ **Asistente Musical Gemini 2.5 Flash**:
He analizado tu consulta sobre *"${userPrompt}"*. Como experto en historia musical, composición y tendencias de audio, puedo ayudarte a:
- Descubrir nuevas canciones según tu estado de ánimo.
- Armar playlists temáticas personalizadas.
- Explorar datos curiosos y discografías de tus bandas favoritas.

¿Sobre qué género o canción te gustaría conversar ahora?`;
}

// --- 4. Llamada segura a la API oficial de Google Gemini ---
function callGeminiApi(promptText, conversationHistory = []) {
    return new Promise((resolve, reject) => {
        const apiKey = GEMINI_API_KEY.trim();
        const hasValidKey = apiKey && apiKey !== 'tu_api_key_aqui' && apiKey.length > 10;
        
        if (!hasValidKey) {
            // Si no hay clave real configurada, responder con el generador musical con aviso amigable
            return resolve({
                text: generateFallbackResponse(promptText),
                source: 'demo-musical-generator',
                notice: 'Operando en modo demostración. Para respuestas en vivo de Gemini 2.5 Flash, ingresa tu GEMINI_API_KEY en el archivo .env.'
            });
        }

        // Construir contenido para la API de Gemini (v1beta)
        const contents = [];
        
        // Historial previo simplificado
        if (Array.isArray(conversationHistory)) {
            conversationHistory.slice(-6).forEach(msg => {
                contents.push({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            });
        }
        
        // Mensaje actual
        contents.push({
            role: 'user',
            parts: [{ text: promptText }]
        });

        const systemInstruction = {
            parts: [{
                text: 'Eres un experto asistente musical de IA integrado en una aplicación de streaming moderno de música llamada SoundWave/Melodia. Tu especialidad es recomendar canciones, analizar álbumes, explicar géneros musicales, sugerir playlists según estados de ánimo y datos de artistas. Sé entusiasta, conciso, creativo y usa formato Markdown amigable con viñetas y emojis musicales.'
            }]
        };

        const postData = JSON.stringify({
            contents,
            systemInstruction,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                topP: 0.95
            }
        });

        // Función auxiliar para realizar la petición HTTP
        const makeRequest = (targetModel) => {
            return new Promise((subResolve, subReject) => {
                const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
                const parsedUrl = new URL(endpointUrl);

                const options = {
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.pathname + parsedUrl.search,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    },
                    timeout: REQUEST_TIMEOUT_MS
                };

                const req = https.request(options, (res) => {
                    let body = '';
                    res.on('data', chunk => { body += chunk; });
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                const parsed = JSON.parse(body);
                                const replyText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                                if (replyText) {
                                    subResolve({
                                        text: replyText,
                                        source: 'gemini-api',
                                        model: targetModel
                                    });
                                } else {
                                    subResolve(null);
                                }
                            } catch (parseErr) {
                                subReject(new Error('Respuesta inválida: ' + parseErr.message));
                            }
                        } else {
                            let errMsg = `HTTP ${res.statusCode}`;
                            try {
                                const errObj = JSON.parse(body);
                                if (errObj.error && errObj.error.message) {
                                    errMsg += `: ${errObj.error.message}`;
                                }
                            } catch (_) {}
                            subReject({ status: res.statusCode, message: errMsg });
                        }
                    });
                });

                req.on('timeout', () => {
                    req.destroy();
                    subReject(new Error('Timeout (' + REQUEST_TIMEOUT_MS + 'ms)'));
                });

                req.on('error', (err) => {
                    subReject(err);
                });

                req.write(postData);
                req.end();
            });
        };

        // Intentar primero con el modelo configurado, luego con alternativas compatibles
        (async () => {
            const candidateModels = [GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            const uniqueModels = Array.from(new Set(candidateModels));

            for (const modelName of uniqueModels) {
                try {
                    const res = await makeRequest(modelName);
                    if (res && res.text) {
                        return resolve(res);
                    }
                } catch (err) {
                    // Si es 404 de modelo no disponible, probar el siguiente
                    console.warn(`[Gemini Proxy] Modelo "${modelName}" no disponible (${err.message || err}).`);
                }
            }

            // Si ningún modelo de la API respondió, suministrar generador musical contextual
            console.warn('[Gemini Proxy] Activando generador musical contextual de contingencia.');
            resolve({
                text: generateFallbackResponse(promptText),
                source: 'demo-musical-generator',
                notice: 'Respuesta generada por el asistente musical SoundWave (contingencia de modelo activo).'
            });
        })().catch(err => {
            resolve({
                text: generateFallbackResponse(promptText),
                source: 'demo-musical-generator',
                notice: 'Respuesta de contingencia: ' + err.message
            });
        });
    });
}

// --- 5. Enrutador HTTP Principal ---
const server = http.createServer(async (req, res) => {
    // CORS headers para permitir llamadas en desarrollo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Endpoint de verificación de configuración pública y estado
    if (pathname === '/api/config' && req.method === 'GET') {
        const hasValidKey = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_api_key_aqui');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            model: GEMINI_MODEL,
            hasApiKey: hasValidKey,
            appName: 'SoundWave Music App',
            env: process.env.APP_ENV || 'development'
        }));
        return;
    }

    // Endpoint Proxy Seguro para el Chatbot
    if (pathname === '/api/chat' && req.method === 'POST') {
        let rawBody = '';
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', async () => {
            try {
                const body = rawBody ? JSON.parse(rawBody) : {};
                const prompt = (body.prompt || '').trim();

                if (!prompt) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'El mensaje no puede estar vacío.' }));
                    return;
                }

                if (prompt.length > 600) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'El mensaje excede la longitud máxima permitida (600 caracteres).' }));
                    return;
                }

                const result = await callGeminiApi(prompt, body.history || []);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    text: result.text,
                    source: result.source,
                    model: result.model || GEMINI_MODEL,
                    notice: result.notice || null
                }));
            } catch (err) {
                console.error('❌ Error en /api/chat:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: err.message || 'Error interno del servidor al procesar la solicitud con Gemini.'
                }));
            }
        });
        return;
    }

    // Servidor de archivos estáticos y fallback SPA
    let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = '/index.html';
    }

    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Si la ruta no tiene extensión y no es de la API, servir index.html (SPA Fallback)
            if (!path.extname(safePath) && !pathname.startsWith('/api/')) {
                const indexPath = path.join(__dirname, 'index.html');
                res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
                return fs.createReadStream(indexPath).pipe(res);
            }

            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('404: Archivo no encontrado');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎵 Servidor SoundWave Music iniciado con éxito`);
    console.log(`📡 URL Local:        http://localhost:${PORT}`);
    console.log(`🤖 Modelo IA:        ${GEMINI_MODEL}`);
    console.log(`🔑 Estado API Key:   ${(GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_api_key_aqui') ? 'Configurada ✅' : 'Modo Demo Activo (Sin API Key configurada) ℹ️'}`);
    console.log(`======================================================\n`);
});
