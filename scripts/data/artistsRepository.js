/**
 * ==============================================================================
 * Repositorio de Artistas
 * ==============================================================================
 * Gestiona información biográfica, géneros y portadas de artistas destacados.
 */

const ARTISTS_DATA = [
    {
        id: 1,
        name: 'Neon Echoes',
        genre: 'Synthwave / Retro Electro',
        monthlyListeners: '2.4M',
        bio: 'Pioneros del retrofuturismo electrónico, mezclando sintetizadores analógicos de los 80 con producción contemporánea.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        verified: true
    },
    {
        id: 2,
        name: 'Aetheria',
        genre: 'Ambient / Soundscapes',
        monthlyListeners: '1.8M',
        bio: 'Productora nórdica reconocida por sus paisajes sonoros inmersivos y atmósferas cinemáticas relajantes.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        verified: true
    },
    {
        id: 3,
        name: 'The Velvet Trio',
        genre: 'Neo-Soul / Jazz Contemporáneo',
        monthlyListeners: '950K',
        bio: 'Trío virtuoso de improvisación en vivo, melodías de saxofón aterciopeladas y bajos sincopados.',
        image: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=400&q=80',
        verified: false
    },
    {
        id: 4,
        name: 'HyperDrive',
        genre: 'Electronic / Future Bass',
        monthlyListeners: '3.1M',
        bio: 'Dúo de productores festivaleros conocidos por sus drops energéticos y percusiones futuristas.',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80',
        verified: true
    },
    {
        id: 5,
        name: 'Aurora Bloom',
        genre: 'Indie Folk / Acústico',
        monthlyListeners: '1.2M',
        bio: 'Cantautora cuyas letras íntimas y arreglos con guitarras de doce cuerdas evocan la naturaleza y el viaje interior.',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
        verified: true
    },
    {
        id: 6,
        name: 'Komorebi',
        genre: 'Lo-Fi Hip Hop / Chillhop',
        monthlyListeners: '4.5M',
        bio: 'Beatmaker de Tokio maestro del sampleo de vinilo y texturas de lluvia para el estudio nocturno.',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
        verified: true
    }
];

export const artistsRepository = {
    getAll() {
        return [...ARTISTS_DATA];
    },

    getById(id) {
        return ARTISTS_DATA.find(a => a.id === Number(id)) || null;
    },

    getByName(name) {
        if (!name) return null;
        return ARTISTS_DATA.find(a => a.name.toLowerCase() === name.toLowerCase()) || null;
    },

    search(query) {
        if (!query || typeof query !== 'string') return this.getAll();
        const q = query.toLowerCase().trim();
        return ARTISTS_DATA.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.genre.toLowerCase().includes(q) ||
            a.bio.toLowerCase().includes(q)
        );
    }
};
