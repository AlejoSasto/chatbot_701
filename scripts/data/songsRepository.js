/**
 * ==============================================================================
 * Repositorio de Canciones
 * ==============================================================================
 * Encapsula la colección de canciones disponibles, proporcionando métodos de
 * consulta, búsqueda y filtrado por género, álbum o artista.
 */

const SONGS_DATA = [
    {
        id: 1,
        title: 'Midnight Horizons',
        artist: 'Neon Echoes',
        album: 'Synthesized Dreams',
        genre: 'Synthwave',
        duration: 218, // 3:38
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
        plays: '2.4M',
        releaseYear: 2024
    },
    {
        id: 2,
        title: 'Solar Eclipse',
        artist: 'Aetheria',
        album: 'Cosmic Journey',
        genre: 'Ambient / Chill',
        duration: 254, // 4:14
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80',
        plays: '1.8M',
        releaseYear: 2023
    },
    {
        id: 3,
        title: 'Urban Grooves',
        artist: 'The Velvet Trio',
        album: 'Late Night Sessions',
        genre: 'Jazz / Neo-Soul',
        duration: 195, // 3:15
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
        plays: '950K',
        releaseYear: 2024
    },
    {
        id: 4,
        title: 'Electric Odyssey',
        artist: 'HyperDrive',
        album: 'Overdrive Pulse',
        genre: 'Electronic / Dance',
        duration: 232, // 3:52
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
        plays: '3.1M',
        releaseYear: 2024
    },
    {
        id: 5,
        title: 'Starlight Symphony',
        artist: 'Aurora Bloom',
        album: 'Acoustic Horizon',
        genre: 'Indie Folk',
        duration: 208, // 3:28
        cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&q=80',
        plays: '1.2M',
        releaseYear: 2023
    },
    {
        id: 6,
        title: 'Echoes in the Rain',
        artist: 'Komorebi',
        album: 'Lo-Fi Chillscapes',
        genre: 'Lo-Fi / Study',
        duration: 164, // 2:44
        cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80',
        plays: '4.5M',
        releaseYear: 2024
    },
    {
        id: 7,
        title: 'Velvet Thunder',
        artist: 'The Midnight Riders',
        album: 'Desert Highway',
        genre: 'Alternative Rock',
        duration: 242, // 4:02
        cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80',
        plays: '820K',
        releaseYear: 2022
    },
    {
        id: 8,
        title: 'Golden Sunset',
        artist: 'Luna Solaris',
        album: 'Vibras del Alma',
        genre: 'Latin / Pop',
        duration: 189, // 3:09
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
        plays: '5.2M',
        releaseYear: 2024
    }
];

export const songsRepository = {
    getAll() {
        return [...SONGS_DATA];
    },

    getById(id) {
        return SONGS_DATA.find(s => s.id === Number(id)) || null;
    },

    getFeatured() {
        return SONGS_DATA.slice(0, 4);
    },

    getByGenre(genre) {
        if (!genre) return this.getAll();
        return SONGS_DATA.filter(s => s.genre.toLowerCase().includes(genre.toLowerCase()));
    },

    getByAlbum(albumName) {
        return SONGS_DATA.filter(s => s.album.toLowerCase() === albumName.toLowerCase());
    },

    search(query) {
        if (!query || typeof query !== 'string') return this.getAll();
        const q = query.toLowerCase().trim();
        return SONGS_DATA.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            s.album.toLowerCase().includes(q) ||
            s.genre.toLowerCase().includes(q)
        );
    }
};
