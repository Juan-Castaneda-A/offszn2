import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../../supabase/client';
import { Link } from 'react-router-dom';
import { 
  BiTimeFive, 
  BiSearch, 
  BiPlay, 
  BiPause, 
  BiTrash, 
  BiCart, 
  BiDownload, 
  BiUser,
  BiShield,
  BiExclamationCircle
} from 'react-icons/bi';

export default function History() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, beat, preset, etc.
  
  // Estado para el modal de confirmar borrado
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Audio Player State
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchHistory();
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Asumimos tabla 'play_history' que registra cada reproducción
      const { data, error } = await supabase
        .from('play_history')
        .select(`
          id,
          played_at,
          product:products (
            id,
            name,
            product_type,
            price_basic,
            image_url,
            download_url_mp3,
            producer_id,
            is_free,
            users ( nickname )
          )
        `)
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50); // Limitamos a los últimos 50 para rendimiento

      if (error) throw error;

      // Aplanar datos
      const formattedHistory = data.map(item => ({
        history_id: item.id, // ID del registro de historial
        played_at: item.played_at,
        ...item.product,
        producer_name: item.product?.users?.nickname || 'Productor'
      }));

      setHistory(formattedHistory);

    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('play_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory([]); // Limpiar estado local
      setShowClearModal(false);
    } catch (error) {
      console.error('Error borrando historial:', error);
      alert('Hubo un error al borrar el historial.');
    } finally {
      setIsClearing(false);
    }
  };

  // --- AUDIO PLAYER LOGIC ---
  const handlePlay = (track) => {
    const url = track.download_url_mp3;
    if (!url) return;

    if (playingId === track.history_id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => console.error("Play error", e));
      setPlayingId(track.history_id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  // --- FILTERING & DATE GROUPING ---
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.producer_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.product_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [history, searchQuery, filterType]);

  // Helper para agrupar por fechas
  const getGroupLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="w-full min-h-screen relative pb-20">
       {/* Background */}
       <div className="fixed top-0 left-0 w-full h-full bg-[#050505] -z-10"></div>

       {/* --- HEADER --- */}
       <div className="mb-8 mt-4">
          <h1 className="text-4xl font-extrabold text-white mb-6 font-['Plus_Jakarta_Sans']">Tu Historial</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-[rgba(255,255,255,0.05)]">
             
             {/* Search & Filters */}
             <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-[300px]">
                   <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                   <input 
                      type="text" 
                      placeholder="Buscar en tu historial..." 
                      className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:border-purple-500/50 outline-none transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
                   {['all', 'beat', 'preset', 'drumkit'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filterType === type ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[#666] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                      >
                        {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                      </button>
                   ))}
                </div>
             </div>

             {/* Clear Button */}
             {history.length > 0 && (
                <button 
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-red-500/20 text-sm font-semibold whitespace-nowrap"
                >
                   <BiTrash /> Borrar historial
                </button>
             )}
          </div>
       </div>

       {/* --- CONTENT --- */}
       <div className="flex flex-col gap-0">
          {loading ? (
             // Skeletons
             [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(255,255,255,0.05)]">
                   <div className="w-14 h-14 bg-[#222] rounded-lg animate-pulse"></div>
                   <div className="flex-1 space-y-2">
                      <div className="w-40 h-4 bg-[#222] rounded animate-pulse"></div>
                      <div className="w-24 h-3 bg-[#222] rounded animate-pulse"></div>
                   </div>
                </div>
             ))
          ) : filteredHistory.length === 0 ? (
             <EmptyState />
          ) : (
             <HistoryList 
                items={filteredHistory} 
                getGroupLabel={getGroupLabel} 
                playingId={playingId} 
                onTogglePlay={handlePlay} 
             />
          )}
       </div>

       {/* --- CLEAR CONFIRMATION MODAL --- */}
       {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
             <div className="bg-[#111] border border-[rgba(255,255,255,0.1)] p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl transform transition-all scale-100">
                <div className="text-4xl text-red-500 mb-4 flex justify-center"><BiExclamationCircle /></div>
                <h3 className="text-white text-xl font-bold mb-2">¿Borrar todo el historial?</h3>
                <p className="text-[#888] text-sm mb-6">Esta acción eliminará permanentemente tu registro de reproducciones. No podrás deshacerlo.</p>
                
                <div className="flex justify-center gap-3">
                   <button 
                     onClick={() => setShowClearModal(false)}
                     className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors font-medium"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleClearHistory}
                     disabled={isClearing}
                     className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-bold disabled:opacity-50"
                   >
                     {isClearing ? 'Borrando...' : 'Confirmar'}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}

// --- SUB-COMPONENT: HISTORY LIST (Handles Date Headers) ---
function HistoryList({ items, getGroupLabel, playingId, onTogglePlay }) {
  let lastGroup = '';

  return items.map((item) => {
    const currentGroup = getGroupLabel(item.played_at);
    const showHeader = currentGroup !== lastGroup;
    lastGroup = currentGroup;

    return (
       <React.Fragment key={item.history_id}>
          {showHeader && (
             <h3 className="text-white text-lg font-bold mt-8 mb-4 font-['Plus_Jakarta_Sans']">{currentGroup}</h3>
          )}
          
          <div className="group grid grid-cols-[60px_1fr_auto] md:grid-cols-[60px_200px_1fr_auto_auto] gap-4 items-center p-4 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-lg">
             
             {/* Cover */}
             <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#222]">
                <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playingId === item.history_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button onClick={() => onTogglePlay(item)} className="text-white hover:scale-110 transition-transform">
                       {playingId === item.history_id ? <BiPause size={24} /> : <BiPlay size={24} />}
                    </button>
                </div>
             </div>

             {/* Info */}
             <div className="min-w-0">
                <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                <div className="flex items-center gap-1 text-[#666] text-xs">
                   <BiUser /> {item.producer_name}
                </div>
             </div>

             {/* Waveform Placeholder (Hidden on Mobile) */}
             <div className="hidden md:flex items-center h-8 bg-[rgba(255,255,255,0.05)] rounded px-2 w-full max-w-[300px]">
                {/* Visual Fake Waveform bars */}
                <div className="flex gap-1 items-end h-full w-full justify-center opacity-30">
                   {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-1 bg-white rounded-t" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                   ))}
                </div>
             </div>

             {/* Badge */}
             <div className="hidden md:block">
                <span className="border border-[#333] text-[#888] text-[10px] font-bold px-2 py-0.5 rounded uppercase">{item.product_type}</span>
             </div>

             {/* Actions */}
             <div className="flex items-center gap-3">
                 <span className={`font-bold text-sm ${item.is_free ? 'text-green-500' : 'text-white'}`}>
                    {item.is_free ? 'FREE' : `$${item.price_basic}`}
                 </span>
                 <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    <BiCart />
                 </button>
             </div>
          </div>
       </React.Fragment>
    );
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
       <div className="text-5xl text-[#222] mb-4"><BiTimeFive /></div>
       <h4 className="text-white font-bold text-lg mb-2">Tu historial está vacío</h4>
       <p className="text-[#666] text-sm mb-6">Empieza a explorar y reproducir beats para verlos aquí.</p>
       <Link to="/explorar" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-full font-bold text-sm transition-colors">
          Explorar Música
       </Link>
    </div>
  );
}