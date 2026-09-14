/**
 * ==============================================================================
 * Repositorio de Playlists
 * ==============================================================================
 * Define colecciones temáticas sugeridas y personalizadas para el usuario.
 */

const PLAYLISTS_DATA = [
    {
        id: 1,
        title: 'Deep Focus & Code Flow',
        description: 'Música instrumental sintética y lo-fi diseñada para máxima concentración.',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
        trackIds: [1, 2, 6],
        creator: 'SoundWave Curators',
        followers: '340K'
    },
    {
        id: 2,
        title: 'Electro Workout Pulse',
        description: 'Ritmos enérgicos por encima de 128 BPM para superar cualquier entrenamiento.',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
        trackIds: [4, 7],
        creator: 'Fitness Beats',
        followers: '820K'
    },
    {
        id: 3,
        title: 'Late Night Coffee & Jazz',
        description: 'Vibra acústica cálida, piano y vientos para desconectar al anochecer.',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        trackIds: [3, 5],
        creator: 'Acoustic Lounge',
        followers: '190K'
    },
    {
        id: 4,
        title: 'Descubrimiento Semanal AI',
        description: 'Selección generada a partir de recomendaciones inteligentes con Gemini 2.5.',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        trackIds: [1, 3, 4, 8],
        creator: 'Gemini 2.5 Music Engine',
        followers: '1.2M'
    }
];

export const playlistsRepository = {
    getAll() {
        return [...PLAYLISTS_DATA];
    },

    getById(id) {
        return PLAYLISTS_DATA.find(p => p.id === Number(id)) || null;
    },

    search(query) {
        if (!query || typeof query !== 'string') return this.getAll();
        const q = query.toLowerCase().trim();
        return PLAYLISTS_DATA.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }
};
