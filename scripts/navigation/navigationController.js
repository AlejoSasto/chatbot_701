/**
 * ==============================================================================
 * Controlador de Navegación y Renderizado de Secciones SPA
 * ==============================================================================
 * Controla el cambio de vistas (Inicio, Buscar, Biblioteca, Favoritos, Playlists,
 * Artistas, Álbumes, Chatbot) sin recargar la página (Sec. 10.1 y RF-01).
 */

import { appState } from '../core/appState.js';
import { eventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';
import { songsRepository } from '../data/songsRepository.js';
import { artistsRepository } from '../data/artistsRepository.js';
import { albumsRepository } from '../data/albumsRepository.js';
import { playlistsRepository } from '../data/playlistsRepository.js';
import { formatTime } from '../utils/formatters.js';

export class NavigationController {
    constructor() {
        this.contentContainer = null;
        this.navLinks = [];
    }

    /**
     * Inicializa las referencias de navegación y renderiza la vista por defecto.
     */
    init() {
        this.contentContainer = document.getElementById('main-content-view');
        this.navLinks = Array.from(document.querySelectorAll('[data-section]'));

        this.bindNavLinks();

        // Suscribirse al evento de navegación
        eventBus.on(CONFIG.EVENTS.NAVIGATE, ({ section }) => {
            this.updateActiveNavIndicator(section);
            this.renderSection(section);
        });

        // Render inicial en "inicio"
        this.renderSection('inicio');
    }

    /**
     * Vincula los clics en elementos de navegación tanto de la barra lateral como de la cabecera.
     */
    bindNavLinks() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                if (targetSection === 'chatbot') {
                    // Si se hace clic en Chatbot, abre el panel de chat
                    appState.setChatOpen(true);
                } else {
                    appState.setActiveSection(targetSection);
                }
            });
        });
    }

    /**
     * Actualiza la clase visual activa en los enlaces del menú.
     */
    updateActiveNavIndicator(sectionName) {
        this.navLinks.forEach(link => {
            const section = link.getAttribute('data-section');
            if (section === sectionName) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Renderiza el contenido correspondiente a la sección seleccionada.
     */
    renderSection(sectionName) {
        if (!this.contentContainer) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        switch (sectionName) {
            case 'inicio':
                this.renderInicioView();
                break;
            case 'buscar':
                this.renderBuscarView();
                break;
            case 'biblioteca':
                this.renderBibliotecaView();
                break;
            case 'favoritos':
                this.renderFavoritosView();
                break;
            case 'playlists':
                this.renderPlaylistsView();
                break;
            case 'artistas':
                this.renderArtistasView();
                break;
            case 'albumes':
                this.renderAlbumesView();
                break;
            default:
                this.renderInicioView();
        }
    }

    // ==========================================
    // VISTA: INICIO
    // ==========================================
    renderInicioView() {
        const featuredSongs = songsRepository.getFeatured();
        const albums = albumsRepository.getAll().slice(0, 4);
        const artists = artistsRepository.getAll().slice(0, 4);
        const playlists = playlistsRepository.getAll().slice(0, 3);

        this.contentContainer.innerHTML = `
            <!-- Hero Banner Destacado -->
            <section class="hero-banner" aria-label="Contenido destacado">
                <div class="hero-content">
                    <span class="hero-badge">DESTACADO DE LA SEMANA</span>
                    <h1 class="hero-title">Explora la Nueva Era Sonora</h1>
                    <p class="hero-desc">Descubre lanzamientos exclusivos, playlists curadas y recomendaciones personalizadas por nuestra IA <strong>Gemini 2.5 Flash</strong>.</p>
                    <div class="hero-actions">
                        <button class="btn btn-primary" id="hero-play-btn">▶ Reproducir Mix Semanal</button>
                        <button class="btn btn-outline" id="hero-chat-btn">✨ Preguntarle al Chatbot</button>
                    </div>
                </div>
            </section>

            <!-- Canciones Recomendadas -->
            <section class="content-section" aria-labelledby="heading-recommended">
                <div class="section-header">
                    <h2 id="heading-recommended" class="section-title">Canciones Recomendadas</h2>
                    <a href="#" class="section-link" data-section="playlists">Ver todo</a>
                </div>
                <div class="cards-grid">
                    ${featuredSongs.map(song => this.renderSongCard(song)).join('')}
                </div>
            </section>

            <!-- Álbumes Populares -->
            <section class="content-section" aria-labelledby="heading-albums">
                <div class="section-header">
                    <h2 id="heading-albums" class="section-title">Álbumes en Tendencia</h2>
                    <a href="#" class="section-link" data-section="albumes">Ver catálogo</a>
                </div>
                <div class="cards-grid">
                    ${albums.map(album => this.renderAlbumCard(album)).join('')}
                </div>
            </section>

            <!-- Artistas Destacados -->
            <section class="content-section" aria-labelledby="heading-artists">
                <div class="section-header">
                    <h2 id="heading-artists" class="section-title">Artistas Destacados</h2>
                    <a href="#" class="section-link" data-section="artistas">Explorar artistas</a>
                </div>
                <div class="cards-grid artists-grid">
                    ${artists.map(artist => this.renderArtistCard(artist)).join('')}
                </div>
            </section>

            <!-- Playlists Sugeridas -->
            <section class="content-section" aria-labelledby="heading-playlists">
                <div class="section-header">
                    <h2 id="heading-playlists" class="section-title">Playlists Sugeridas</h2>
                    <a href="#" class="section-link" data-section="playlists">Todas las listas</a>
                </div>
                <div class="cards-grid">
                    ${playlists.map(pl => this.renderPlaylistCard(pl)).join('')}
                </div>
            </section>
        `;

        this.attachCardEvents();

        // Botones del hero
        const heroPlay = document.getElementById('hero-play-btn');
        if (heroPlay) {
            heroPlay.addEventListener('click', () => {
                const songs = songsRepository.getAll();
                if (songs.length) appState.setCurrentTrack(songs[0], true);
            });
        }
        const heroChat = document.getElementById('hero-chat-btn');
        if (heroChat) {
            heroChat.addEventListener('click', () => {
                appState.setChatOpen(true);
            });
        }
    }

    // ==========================================
    // VISTA: BUSCAR
    // ==========================================
    renderBuscarView() {
        const query = appState.getSearchQuery();
        const songs = songsRepository.search(query);
        const artists = artistsRepository.search(query);
        const albums = albumsRepository.search(query);

        this.contentContainer.innerHTML = `
            <section class="search-view">
                <div class="search-bar-wrapper">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="live-search-input" class="search-input" 
                           placeholder="¿Qué quieres escuchar hoy? (Canciones, artistas, álbumes, géneros...)" 
                           value="${escapeHtml(query)}" autofocus>
                    ${query ? '<button id="clear-search-btn" class="search-clear-btn" aria-label="Limpiar búsqueda">&times;</button>' : ''}
                </div>

                <div class="search-tags">
                    <span class="search-tag-label">Explorar por género:</span>
                    <button class="genre-pill" data-genre="Synthwave">Synthwave</button>
                    <button class="genre-pill" data-genre="Ambient">Ambient</button>
                    <button class="genre-pill" data-genre="Jazz">Jazz & Soul</button>
                    <button class="genre-pill" data-genre="Electronic">Electronic</button>
                    <button class="genre-pill" data-genre="Lo-Fi">Lo-Fi</button>
                    <button class="genre-pill" data-genre="Rock">Rock</button>
                </div>

                <div class="search-results">
                    <h2 class="section-title">Resultados de canciones (${songs.length})</h2>
                    ${songs.length > 0 ? `
                        <div class="cards-grid">
                            ${songs.map(song => this.renderSongCard(song)).join('')}
                        </div>
                    ` : '<p class="empty-state-text">No se encontraron canciones que coincidan con tu búsqueda.</p>'}

                    ${artists.length > 0 ? `
                        <h2 class="section-title" style="margin-top: 2rem;">Artistas relacionados (${artists.length})</h2>
                        <div class="cards-grid artists-grid">
                            ${artists.map(artist => this.renderArtistCard(artist)).join('')}
                        </div>
                    ` : ''}

                    ${albums.length > 0 ? `
                        <h2 class="section-title" style="margin-top: 2rem;">Álbumes (${albums.length})</h2>
                        <div class="cards-grid">
                            ${albums.map(album => this.renderAlbumCard(album)).join('')}
                        </div>
                    ` : ''}
                </div>
            </section>
        `;

        this.attachCardEvents();

        const searchInput = document.getElementById('live-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                appState.setSearchQuery(e.target.value);
                this.renderBuscarView();
            });
        }

        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                appState.setSearchQuery('');
                this.renderBuscarView();
            });
        }

        // Clic en píldoras de género
        document.querySelectorAll('.genre-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const genre = pill.getAttribute('data-genre');
                appState.setSearchQuery(genre);
                this.renderBuscarView();
            });
        });
    }

    // ==========================================
    // VISTA: BIBLIOTECA
    // ==========================================
    renderBibliotecaView() {
        const playlists = playlistsRepository.getAll();
        const albums = albumsRepository.getAll();

        this.contentContainer.innerHTML = `
            <section class="content-section">
                <h1 class="page-title">Tu Biblioteca</h1>
                <p class="section-desc">Accede a tus playlists guardadas, álbumes de colección y selecciones periódicas.</p>
                
                <h2 class="section-title" style="margin-top: 1.5rem;">Tus Playlists</h2>
                <div class="cards-grid">
                    ${playlists.map(pl => this.renderPlaylistCard(pl)).join('')}
                </div>

                <h2 class="section-title" style="margin-top: 2rem;">Álbumes Guardados</h2>
                <div class="cards-grid">
                    ${albums.map(al => this.renderAlbumCard(al)).join('')}
                </div>
            </section>
        `;

        this.attachCardEvents();
    }

    // ==========================================
    // VISTA: FAVORITOS
    // ==========================================
    renderFavoritosView() {
        const favIds = appState.getFavorites();
        const favSongs = songsRepository.getAll().filter(s => favIds.includes(s.id));

        this.contentContainer.innerHTML = `
            <section class="content-section">
                <div class="favorites-header">
                    <div class="favorites-hero-icon">❤️</div>
                    <div>
                        <span class="hero-badge">PLAYLIST AUTOMÁTICA</span>
                        <h1 class="page-title">Canciones que te gustan</h1>
                        <p class="section-desc">${favSongs.length} canciones guardadas en tus favoritos.</p>
                    </div>
                </div>

                ${favSongs.length > 0 ? `
                    <div class="songs-table-wrapper">
                        <table class="songs-table" aria-label="Lista de canciones favoritas">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Título</th>
                                    <th>Álbum</th>
                                    <th>Género</th>
                                    <th>Duración</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${favSongs.map((song, i) => `
                                    <tr class="song-table-row" data-song-id="${song.id}">
                                        <td>${i + 1}</td>
                                        <td class="song-table-title">
                                            <img src="${song.cover}" alt="${song.title}" class="song-table-thumb">
                                            <div>
                                                <strong>${song.title}</strong>
                                                <span>${song.artist}</span>
                                            </div>
                                        </td>
                                        <td>${song.album}</td>
                                        <td><span class="genre-tag">${song.genre}</span></td>
                                        <td>${formatTime(song.duration)}</td>
                                        <td>
                                            <button class="btn-play-sm" data-play-song-id="${song.id}" aria-label="Reproducir ${song.title}">▶</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <p class="empty-state-text">Aún no has agregado canciones a favoritos. Haz clic en el corazón de cualquier tarjeta o reproductor.</p>
                    </div>
                `}
            </section>
        `;

        this.attachTableEvents();
    }

    // ==========================================
    // VISTA: PLAYLISTS
    // ==========================================
    renderPlaylistsView() {
        const playlists = playlistsRepository.getAll();

        this.contentContainer.innerHTML = `
            <section class="content-section">
                <h1 class="page-title">Colección de Playlists</h1>
                <p class="section-desc">Selecciones dinámicas creadas por curadores y generadas por IA para cada estado de ánimo.</p>
                <div class="cards-grid">
                    ${playlists.map(pl => this.renderPlaylistCard(pl)).join('')}
                </div>
            </section>
        `;

        this.attachCardEvents();
    }

    // ==========================================
    // VISTA: ARTISTAS
    // ==========================================
    renderArtistasView() {
        const artists = artistsRepository.getAll();

        this.contentContainer.innerHTML = `
            <section class="content-section">
                <h1 class="page-title">Artistas del Momento</h1>
                <p class="section-desc">Explora las trayectorias, biografías y producciones de los talentos más destacados.</p>
                <div class="cards-grid artists-grid">
                    ${artists.map(art => this.renderArtistCard(art)).join('')}
                </div>
            </section>
        `;

        this.attachCardEvents();
    }

    // ==========================================
    // VISTA: ÁLBUMES
    // ==========================================
    renderAlbumesView() {
        const albums = albumsRepository.getAll();

        this.contentContainer.innerHTML = `
            <section class="content-section">
                <h1 class="page-title">Álbumes Completos</h1>
                <p class="section-desc">Grandes obras discográficas concebidas de principio a fin.</p>
                <div class="cards-grid">
                    ${albums.map(al => this.renderAlbumCard(al)).join('')}
                </div>
            </section>
        `;

        this.attachCardEvents();
    }

    // ==========================================
    // HELPERS DE RENDERIZADO DE TARJETAS
    // ==========================================
    renderSongCard(song) {
        const isFav = appState.isFavorite(song.id);
        return `
            <article class="music-card" data-song-id="${song.id}" tabindex="0">
                <div class="card-cover-wrapper">
                    <img src="${song.cover}" alt="Portada de ${song.title}" class="card-cover" loading="lazy">
                    <button class="card-play-btn" data-play-song-id="${song.id}" aria-label="Reproducir ${song.title}">
                        ▶
                    </button>
                    <button class="card-fav-btn ${isFav ? 'is-active' : ''}" data-fav-song-id="${song.id}" aria-label="Favorito">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="card-info">
                    <h3 class="card-title" title="${song.title}">${song.title}</h3>
                    <p class="card-subtitle">${song.artist}</p>
                    <div class="card-meta">
                        <span class="genre-tag">${song.genre}</span>
                        <span class="card-duration">${formatTime(song.duration)}</span>
                    </div>
                </div>
            </article>
        `;
    }

    renderAlbumCard(album) {
        return `
            <article class="music-card music-card-album" data-album-id="${album.id}" tabindex="0">
                <div class="card-cover-wrapper">
                    <img src="${album.cover}" alt="Portada de ${album.title}" class="card-cover" loading="lazy">
                    <button class="card-play-btn" data-play-album-id="${album.id}" aria-label="Reproducir álbum ${album.title}">
                        ▶
                    </button>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${album.title}</h3>
                    <p class="card-subtitle">${album.artist} • ${album.year}</p>
                    <div class="card-meta">
                        <span>${album.trackCount} temas</span>
                        <span>${album.totalDuration}</span>
                    </div>
                </div>
            </article>
        `;
    }

    renderArtistCard(artist) {
        return `
            <article class="music-card music-card-artist" data-artist-id="${artist.id}" tabindex="0">
                <div class="card-cover-wrapper artist-avatar-wrapper">
                    <img src="${artist.image}" alt="Foto de ${artist.name}" class="card-cover artist-avatar" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-title">${artist.name} ${artist.verified ? '✓' : ''}</h3>
                    <p class="card-subtitle">${artist.genre}</p>
                    <span class="listeners-badge">${artist.monthlyListeners} oyentes</span>
                </div>
            </article>
        `;
    }

    renderPlaylistCard(playlist) {
        return `
            <article class="music-card music-card-playlist" data-playlist-id="${playlist.id}" tabindex="0">
                <div class="card-cover-wrapper">
                    <img src="${playlist.cover}" alt="Portada de ${playlist.title}" class="card-cover" loading="lazy">
                    <button class="card-play-btn" data-play-playlist-id="${playlist.id}" aria-label="Reproducir playlist ${playlist.title}">
                        ▶
                    </button>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${playlist.title}</h3>
                    <p class="card-subtitle">${playlist.description}</p>
                    <span class="listeners-badge">${playlist.followers} seguidores</span>
                </div>
            </article>
        `;
    }

    // ==========================================
    // VINCULACIÓN DE EVENTOS EN ELEMENTOS RENDERIZADOS
    // ==========================================
    attachCardEvents() {
        // Clic en reproducir canción desde cualquier tarjeta
        document.querySelectorAll('[data-play-song-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = Number(btn.getAttribute('data-play-song-id'));
                const song = songsRepository.getById(songId);
                if (song) {
                    appState.setCurrentTrack(song, true);
                }
            });
        });

        // Clic en botón favorito de tarjeta
        document.querySelectorAll('[data-fav-song-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = Number(btn.getAttribute('data-fav-song-id'));
                appState.toggleFavorite(songId);
                const isFav = appState.isFavorite(songId);
                btn.textContent = isFav ? '❤️' : '🤍';
                btn.classList.toggle('is-active', isFav);
            });
        });

        // Clic en tarjeta completa reproduce la canción
        document.querySelectorAll('.music-card[data-song-id]').forEach(card => {
            card.addEventListener('click', () => {
                const songId = Number(card.getAttribute('data-song-id'));
                const song = songsRepository.getById(songId);
                if (song) appState.setCurrentTrack(song, true);
            });
        });

        // Clic en enlaces internos que cambian sección
        document.querySelectorAll('.section-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                appState.setActiveSection(section);
            });
        });
    }

    attachTableEvents() {
        document.querySelectorAll('[data-play-song-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = Number(btn.getAttribute('data-play-song-id'));
                const song = songsRepository.getById(songId);
                if (song) appState.setCurrentTrack(song, true);
            });
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
