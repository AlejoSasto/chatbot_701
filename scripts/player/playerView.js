/**
 * ==============================================================================
 * Vista del Reproductor Persistente de Audio
 * ==============================================================================
 * Gestiona el renderizado y actualización visual de los controles, carátula,
 * barra de progreso y volumen del reproductor persistente (Sec. 10.3).
 */

import { formatTime } from '../utils/formatters.js';

export class PlayerView {
    constructor() {
        this.trackCover = null;
        this.trackTitle = null;
        this.trackArtist = null;
        this.playPauseBtn = null;
        this.playPauseIcon = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.progressBar = null;
        this.currentTimeEl = null;
        this.durationEl = null;
        this.volumeSlider = null;
        this.volumeBtn = null;
        this.volumeIcon = null;
        this.favoriteBtn = null;
    }

    /**
     * Captura los elementos del DOM del reproductor.
     */
    init() {
        this.trackCover = document.getElementById('player-cover');
        this.trackTitle = document.getElementById('player-title');
        this.trackArtist = document.getElementById('player-artist');
        this.playPauseBtn = document.getElementById('player-play-pause-btn');
        this.playPauseIcon = document.getElementById('player-play-pause-icon');
        this.prevBtn = document.getElementById('player-prev-btn');
        this.nextBtn = document.getElementById('player-next-btn');
        this.progressBar = document.getElementById('player-progress-bar');
        this.currentTimeEl = document.getElementById('player-current-time');
        this.durationEl = document.getElementById('player-duration');
        this.volumeSlider = document.getElementById('player-volume-slider');
        this.volumeBtn = document.getElementById('player-volume-btn');
        this.volumeIcon = document.getElementById('player-volume-icon');
        this.favoriteBtn = document.getElementById('player-favorite-btn');
    }

    /**
     * Actualiza la información de la canción cargada en la barra.
     * @param {Object} track - Objeto de canción
     */
    updateTrackInfo(track) {
        if (!track) {
            if (this.trackTitle) this.trackTitle.textContent = 'Selecciona una canción';
            if (this.trackArtist) this.trackArtist.textContent = 'SoundWave Player';
            if (this.trackCover) {
                this.trackCover.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80';
                this.trackCover.alt = 'Sin reproducción activa';
            }
            if (this.durationEl) this.durationEl.textContent = '0:00';
            if (this.currentTimeEl) this.currentTimeEl.textContent = '0:00';
            if (this.progressBar) {
                this.progressBar.value = 0;
                this.progressBar.max = 100;
            }
            return;
        }

        if (this.trackTitle) this.trackTitle.textContent = track.title;
        if (this.trackArtist) this.trackArtist.textContent = track.artist;
        if (this.trackCover) {
            this.trackCover.src = track.cover;
            this.trackCover.alt = `Carátula del álbum ${track.album}`;
        }
        if (this.durationEl) this.durationEl.textContent = formatTime(track.duration);
        if (this.progressBar) {
            this.progressBar.max = track.duration || 100;
            this.progressBar.value = 0;
        }
    }

    /**
     * Actualiza el ícono de play / pause y su atributo ARIA.
     * @param {boolean} isPlaying 
     */
    setPlayingState(isPlaying) {
        if (!this.playPauseIcon || !this.playPauseBtn) return;

        if (isPlaying) {
            this.playPauseIcon.textContent = '⏸';
            this.playPauseBtn.setAttribute('aria-label', 'Pausar canción actual');
            this.playPauseBtn.classList.add('is-playing');
        } else {
            this.playPauseIcon.textContent = '▶';
            this.playPauseBtn.setAttribute('aria-label', 'Reproducir canción');
            this.playPauseBtn.classList.remove('is-playing');
        }
    }

    /**
     * Actualiza los valores de la barra de progreso y el cronómetro.
     */
    updateProgress(currentTime, duration) {
        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = formatTime(currentTime);
        }
        if (this.progressBar && !this.progressBar.matches(':active')) {
            this.progressBar.value = currentTime;
            if (duration) this.progressBar.max = duration;
        }
    }

    /**
     * Actualiza el deslizador de volumen e ícono.
     */
    updateVolume(volume, isMuted) {
        if (this.volumeSlider) {
            this.volumeSlider.value = isMuted ? 0 : volume * 100;
        }
        if (this.volumeIcon) {
            if (isMuted || volume === 0) {
                this.volumeIcon.textContent = '🔇';
            } else if (volume < 0.5) {
                this.volumeIcon.textContent = '🔉';
            } else {
                this.volumeIcon.textContent = '🔊';
            }
        }
    }

    /**
     * Actualiza el botón de favorito en la barra del reproductor.
     */
    updateFavoriteState(isFavorite) {
        if (!this.favoriteBtn) return;
        this.favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
        this.favoriteBtn.setAttribute('aria-label', isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos');
    }
}
