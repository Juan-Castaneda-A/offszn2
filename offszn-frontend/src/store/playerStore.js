import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  playlist: [],
  volume: 0.8,
  
  // Acciones
  setPlaylist: (tracks) => set({ playlist: tracks }),
  
  playTrack: (track) => {
    const { currentTrack } = get();
    // Si es el mismo track, no hacemos nada (la lógica de toggle la maneja el componente UI)
    if (currentTrack?.id === track.id) {
      return; 
    }
    set({ currentTrack: track, isPlaying: true });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setVolume: (vol) => set({ volume: vol }),

  playNext: () => {
    const { playlist, currentTrack } = get();
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(p => p.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length; // Loop infinito
    set({ currentTrack: playlist[nextIndex], isPlaying: true });
  },

  playPrev: () => {
    const { playlist, currentTrack } = get();
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(p => p.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    set({ currentTrack: playlist[prevIndex], isPlaying: true });
  },
  
  closePlayer: () => set({ currentTrack: null, isPlaying: false })
}));