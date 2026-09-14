/**
 * ==============================================================================
 * Módulo de Sanitización y Seguridad Web
 * ==============================================================================
 * Previene vulnerabilidades de Cross-Site Scripting (XSS) y manipulación del DOM
 * limpiando cadenas de texto ingresadas por el usuario o recibidas desde la API.
 */

/**
 * Escapa caracteres HTML peligrosos convirtiéndolos en entidades seguras.
 * @param {string} str - Texto a escapar
 * @returns {string} Texto seguro para insertar en el DOM
 */
export function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitiza una cadena eliminando etiquetas HTML o scripts no permitidos.
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto plano limpio
 */
export function stripHtmlTags(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Convierte un texto con formato markdown básico (negrita, cursiva, viñetas, enlaces)
 * en HTML seguro previamente sanitizado.
 * @param {string} markdown - Texto con markdown
 * @returns {string} HTML seguro renderizable
 */
export function safeMarkdownToHtml(markdown) {
    if (typeof markdown !== 'string') return '';

    // Primero escapamos todo para neutralizar inyecciones de script o HTML arbitrario
    let clean = escapeHtml(markdown);

    // Negritas: **texto** o __texto__
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    clean = clean.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Cursivas: *texto* o _texto_
    clean = clean.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    clean = clean.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Código en línea: `código`
    clean = clean.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Formatear saltos de línea y viñetas
    const lines = clean.split(/\r?\n/);
    let inList = false;
    let htmlOutput = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
                htmlOutput += '<ul class="chat-list">';
                inList = true;
            }
            htmlOutput += `<li>${trimmed.substring(2)}</li>`;
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (!inList) {
                htmlOutput += '<ol class="chat-list">';
                inList = true;
            }
            htmlOutput += `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
        } else {
            if (inList) {
                htmlOutput += '</ul>';
                inList = false;
            }
            if (trimmed) {
                htmlOutput += `<p>${trimmed}</p>`;
            }
        }
    }

    if (inList) {
        htmlOutput += '</ul>';
    }

    return htmlOutput;
}
