/**
 * ==============================================================================
 * Controlador del Reproductor de Música
 * ==============================================================================
 * Orquesta la lógica de reproducción, avance de pistas, volumen y sincronización
 * con el catálogo musical y el estado global (Sec. 8.2 y 10.3).
 */

import { appState } from '../core/appState.js';
import { eventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';
import { songsRepository } from '../data/songsRepository.js';

export class PlayerController {
    constructor(view) {
        this.view = view;
        this.playbackTimer = null;
    }

    /**
     * Inicializa los listeners y carga la primera pista disponible.
     */
    init() {
        this.view.init();

        // Cargar canción inicial por defecto
        const allSongs = songsRepository.getAll();
        if (allSongs.length > 0) {
            appState.setCurrentTrack(allSongs[0], false);
        }

        this.subscribeToEvents();
        this.bindUserControls();
    }

    /**
     * Conecta el controlador con los eventos del EventBus.
     */
    subscribeToEvents() {
        eventBus.on(CONFIG.EVENTS.TRACK_CHANGE, ({ track, isPlaying }) => {
            this.view.updateTrackInfo(track);
            this.view.setPlayingState(isPlaying);
            this.view.updateFavoriteState(appState.isFavorite(track.id));
            if (isPlaying) {
                this.startProgressTicker();
            } else {
                this.stopProgressTicker();
            }
        });

        eventBus.on(CONFIG.EVENTS.TRACK_PLAY, () => {
            this.view.setPlayingState(true);
            this.startProgressTicker();
        });

        eventBus.on(CONFIG.EVENTS.TRACK_PAUSE, () => {
            this.view.setPlayingState(false);
            this.stopProgressTicker();
        });

        eventBus.on(CONFIG.EVENTS.PROGRESS_UPDATE, ({ currentTime, duration }) => {
            this.view.updateProgress(currentTime, duration);
        });

        eventBus.on(CONFIG.EVENTS.VOLUME_CHANGE, ({ volume, isMuted }) => {
            this.view.updateVolume(volume, isMuted);
        });
    }

    /**
     * Vincula eventos de clic y sliders de la interfaz del reproductor.
     */
    bindUserControls() {
        // Botón Play / Pause
        if (this.view.playPauseBtn) {
            this.view.playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }

        // Botón Siguiente
        if (this.view.nextBtn) {
            this.view.nextBtn.addEventListener('click', () => {
                this.playNextTrack();
            });
        }

        // Botón Anterior
        if (this.view.prevBtn) {
            this.view.prevBtn.addEventListener('click', () => {
                this.playPreviousTrack();
            });
        }

        // Barra de progreso (seek)
        if (this.view.progressBar) {
            this.view.progressBar.addEventListener('input', (e) => {
                const targetTime = Number(e.target.value);
                appState.setProgress(targetTime);
            });
        }

        // Slider de volumen
        if (this.view.volumeSlider) {
            this.view.volumeSlider.addEventListener('input', (e) => {
                const vol = Number(e.target.value) / 100;
                appState.setVolume(vol);
            });
        }

        // Botón de mute
        if (this.view.volumeBtn) {
            this.view.volumeBtn.addEventListener('click', () => {
                appState.toggleMute();
            });
        }

        // Botón favorito en la barra
        if (this.view.favoriteBtn) {
            this.view.favoriteBtn.addEventListener('click', () => {
                const current = appState.getCurrentTrack();
                if (current) {
                    appState.toggleFavorite(current.id);
                    this.view.updateFavoriteState(appState.isFavorite(current.id));
                }
            });
        }

        // Atajos de teclado para controles del reproductor (Espacio = Play/Pause)
        document.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlayPause();
            } else if (e.code === 'ArrowRight' && e.ctrlKey) {
                this.playNextTrack();
            } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
                this.playPreviousTrack();
            }
        });
    }

    togglePlayPause() {
        const currentlyPlaying = appState.isPlaying();
        appState.setPlaying(!currentlyPlaying);
    }

    playNextTrack() {
        const current = appState.getCurrentTrack();
        const songs = songsRepository.getAll();
        if (!songs.length) return;

        let currentIndex = songs.findIndex(s => s.id === current?.id);
        let nextIndex = (currentIndex + 1) % songs.length;
        appState.setCurrentTrack(songs[nextIndex], true);
    }

    playPreviousTrack() {
        const current = appState.getCurrentTrack();
        const songs = songsRepository.getAll();
        if (!songs.length) return;

        let currentIndex = songs.findIndex(s => s.id === current?.id);
        let prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        appState.setCurrentTrack(songs[prevIndex], true);
    }

    /**
     * Simula el avance continuo del tiempo de reproducción mientras la pista esté en Play.
     */
    startProgressTicker() {
        this.stopProgressTicker();
        this.playbackTimer = setInterval(() => {
            if (!appState.isPlaying()) return;

            const current = appState.getCurrentTime();
            const duration = appState.getDuration();

            if (current >= duration) {
                // Al terminar la pista, avanzar automáticamente a la siguiente
                this.playNextTrack();
            } else {
                appState.setProgress(current + 1, duration);
            }
        }, 1000);
    }

    stopProgressTicker() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }
}
