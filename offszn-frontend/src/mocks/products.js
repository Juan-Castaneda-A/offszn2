// src/mocks/products.js

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'DARK PIANO VOL. 1',
    producer_name: 'Tainy',
    price_basic: 29.99,
    image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&auto=format&fit=crop',
    audio_url: '/audio/track1.mp3', // Audio de prueba
    is_free: false,
    category: 'Drum Kits',
    plays_count: 1240,
  },
  {
    id: '2',
    name: 'LATIN DRILL PACK',
    producer_name: 'Bizarrap',
    price_basic: 0,
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
    audio_url: '/audio/track2.mp3',
    is_free: true,
    category: 'Loops',
    plays_count: 850,
  },
  {
    id: '3',
    name: 'MIDNIGHT VIBES',
    producer_name: 'Ovy On The Drums',
    price_basic: 19.99,
    image_url: 'https://images.unsplash.com/photo-1514525253440-b393452e27ab?q=80&w=300&auto=format&fit=crop',
    audio_url: '/audio/track3.mp3',
    is_free: false,
    category: 'Beats',
    plays_count: 3200,
  },
  // Agrega más si quieres probar el scroll
];