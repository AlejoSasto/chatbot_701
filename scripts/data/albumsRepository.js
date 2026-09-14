/**
 * ==============================================================================
 * Repositorio de Álbumes
 * ==============================================================================
 * Administra el catálogo de lanzamientos discográficos completos.
 */

const ALBUMS_DATA = [
    {
        id: 1,
        title: 'Synthesized Dreams',
        artist: 'Neon Echoes',
        year: 2024,
        genre: 'Synthwave',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
        trackCount: 10,
        totalDuration: '38 min'
    },
    {
        id: 2,
        title: 'Cosmic Journey',
        artist: 'Aetheria',
        year: 2023,
        genre: 'Ambient',
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
        trackCount: 8,
        totalDuration: '44 min'
    },
    {
        id: 3,
        title: 'Late Night Sessions',
        artist: 'The Velvet Trio',
        year: 2024,
        genre: 'Jazz / Neo-Soul',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        trackCount: 12,
        totalDuration: '48 min'
    },
    {
        id: 4,
        title: 'Overdrive Pulse',
        artist: 'HyperDrive',
        year: 2024,
        genre: 'Electronic',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
        trackCount: 9,
        totalDuration: '35 min'
    },
    {
        id: 5,
        title: 'Lo-Fi Chillscapes',
        artist: 'Komorebi',
        year: 2024,
        genre: 'Lo-Fi',
        cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
        trackCount: 15,
        totalDuration: '42 min'
    },
    {
        id: 6,
        title: 'Vibras del Alma',
        artist: 'Luna Solaris',
        year: 2024,
        genre: 'Latin / Pop',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        trackCount: 11,
        totalDuration: '37 min'
    }
];

export const albumsRepository = {
    getAll() {
        return [...ALBUMS_DATA];
    },

    getById(id) {
        return ALBUMS_DATA.find(a => a.id === Number(id)) || null;
    },

    search(query) {
        if (!query || typeof query !== 'string') return this.getAll();
        const q = query.toLowerCase().trim();
        return ALBUMS_DATA.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.artist.toLowerCase().includes(q) ||
            a.genre.toLowerCase().includes(q)
        );
    }
};
