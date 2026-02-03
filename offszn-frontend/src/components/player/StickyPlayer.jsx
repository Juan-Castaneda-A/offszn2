import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore'; // Por si necesitamos auth
import { Link } from 'react-router-dom';

const StickyPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    togglePlay, 
    playNext, 
    playPrev, 
    closePlayer 
  } = usePlayerStore();

  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalTime, setTotalTime] = useState('--:--');

  // 1. Inicializar WaveSurfer cuando cambia el track
  useEffect(() => {
    if (!currentTrack || !waveformRef.current) return;

    // Destruir instancia previa si existe
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    // Crear nueva instancia
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#444',
      progressColor: '#8b5cf6', // Tu color morado
      cursorColor: '#fff',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 40,
      normalize: true,
      backend: 'MediaElement', // Más estable
    });

    // Cargar audio
    wavesurfer.current.load(currentTrack.audio_url);
    wavesurfer.current.setVolume(volume);

    // Eventos
    wavesurfer.current.on('ready', () => {
      setTotalTime(formatTime(wavesurfer.current.getDuration()));
      if (isPlaying) wavesurfer.current.play();
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(formatTime(wavesurfer.current.getCurrentTime()));
    });

    wavesurfer.current.on('finish', () => {
      playNext();
    });

    return () => {
      if (wavesurfer.current) wavesurfer.current.destroy();
    };
  }, [currentTrack]);

  // 2. Controlar Play/Pause desde el Store
  useEffect(() => {
    if (!wavesurfer.current) return;
    isPlaying ? wavesurfer.current.play() : wavesurfer.current.pause();
  }, [isPlaying]);

  // 3. Controlar Volumen
  useEffect(() => {
    if (wavesurfer.current) wavesurfer.current.setVolume(volume);
  }, [volume]);

  // Helper de tiempo
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) return null; // No mostrar si no hay track

  return (
    <div className={`fixed bottom-0 left-0 w-full h-[90px] bg-[#121212] border-t border-white/10 flex items-center justify-between px-6 z-[9990] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ${currentTrack ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* --- LEFT: INFO --- */}
      <div className="flex items-center flex-1 gap-3 min-w-[200px]">
        <img 
          src={currentTrack.image_url} 
          alt="Cover" 
          className="w-14 h-14 rounded-md object-cover bg-zinc-800 flex-shrink-0"
        />
        <div className="flex flex-col overflow-hidden">
          <Link to={`/producto/${currentTrack.id}`} className="text-white text-sm font-bold truncate hover:underline">
            {currentTrack.name}
          </Link>
          <span className="text-xs text-zinc-400 truncate">
            {currentTrack.producer_name}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 ml-2">
          <button className="text-zinc-400 hover:text-red-500 transition-colors">
            <i className="bi bi-heart"></i>
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <i className="bi bi-download"></i>
          </button>
        </div>
      </div>

      {/* --- CENTER: CONTROLS & WAVEFORM --- */}
      <div className="flex flex-col items-center justify-center w-1/2 max-w-[720px] gap-1">
        {/* Row 1: Time & Wave */}
        <div className="hidden md:flex items-center w-full gap-3 text-xs font-mono text-zinc-500 font-bold">
          <span className="w-[40px] text-center">{currentTime}</span>
          <div ref={waveformRef} className="flex-1 cursor-pointer" />
          <span className="w-[40px] text-center">{totalTime}</span>
        </div>
        
        {/* Row 2: Controls */}
        <div className="flex items-center gap-6 mt-1">
          <button onClick={playPrev} className="text-zinc-400 hover:text-white text-lg transition-transform hover:scale-110">
            <i className="bi bi-skip-start-fill"></i>
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-xl hover:scale-105 transition-transform"
          >
            {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill ml-0.5"></i>}
          </button>
          
          <button onClick={playNext} className="text-zinc-400 hover:text-white text-lg transition-transform hover:scale-110">
            <i className="bi bi-skip-end-fill"></i>
          </button>
        </div>
      </div>

      {/* --- RIGHT: ACTIONS --- */}
      <div className="flex items-center justify-end flex-1 gap-4">
        {/* Volume Icon (Simplificado) */}
        <div className="hidden sm:block text-zinc-400">
           <i className="bi bi-volume-up-fill"></i>
        </div>

        <button className="bg-[#8A2BE2] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all">
          <i className="bi bi-cart-plus"></i>
          <span>{currentTrack.is_free ? 'FREE' : `$${currentTrack.price_basic}`}</span>
        </button>

        <button onClick={closePlayer} className="text-zinc-500 hover:text-white md:hidden">
            <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default StickyPlayer;