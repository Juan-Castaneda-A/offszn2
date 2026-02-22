import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../../api/client';
import { Link } from 'react-router-dom';
import {
   History as HistoryIcon,
   Search,
   Play,
   Pause,
   Trash2,
   ShoppingCart,
   Download,
   User,
   Shield,
   AlertCircle,
   Calendar,
   Music,
   ListFilter,
   Loader2,
   ChevronRight,
   Disc,
   Sparkles,
   ArrowUpRight,
   Clock
} from 'lucide-react';

export default function History() {
   const [loading, setLoading] = useState(true);
   const [history, setHistory] = useState([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [filterType, setFilterType] = useState('all');

   const [showClearModal, setShowClearModal] = useState(false);
   const [isClearing, setIsClearing] = useState(false);

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
            .limit(50);

         if (error) throw error;

         const formattedHistory = data.map(item => ({
            history_id: item.id,
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

         setHistory([]);
         setShowClearModal(false);
      } catch (error) {
         console.error('Error borrando historial:', error);
      } finally {
         setIsClearing(false);
      }
   };

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

   const filteredHistory = useMemo(() => {
      return history.filter(item => {
         const nameMatches = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
         const producerMatches = (item.producer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
         const matchesType = filterType === 'all' || item.product_type === filterType;
         return (nameMatches || producerMatches) && matchesType;
      });
   }, [history, searchQuery, filterType]);

   const getGroupLabel = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Hoy';
      if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
   };

   if (loading) {
      return (
         <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-violet-500" size={48} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Sincronizando cronología...</span>
         </div>
      );
   }

   return (
      <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

         {/* --- HEADER --- */}
         <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                        <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Playback</span>
                     </div>
                     <div className="h-px w-8 bg-white/5"></div>
                  </div>
                  <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Mi <span className="text-violet-500">Historial</span></h1>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                     <Clock size={12} className="text-violet-500" /> Registro de tus últimas 50 reproducciones en la plataforma
                  </p>
               </div>

               <div className="flex items-center gap-4">
                  {history.length > 0 && (
                     <button
                        onClick={() => setShowClearModal(true)}
                        className="flex items-center gap-2 text-white/50 hover:text-white bg-white/5 hover:bg-red-500/10 px-6 py-3 rounded-2xl transition-all border border-white/5 hover:border-red-500/20 text-[10px] font-black uppercase tracking-widest active:scale-95"
                     >
                        <Trash2 size={14} /> Limpiar Todo
                     </button>
                  )}
               </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-4 bg-[#0A0A0A] border border-white/5 rounded-[32px] backdrop-blur-xl">
               {/* Search */}
               <div className="relative w-full lg:w-[450px] group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-violet-500 transition-colors" size={18} />
                  <input
                     type="text"
                     placeholder="Buscar en el historial..."
                     className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-xs font-bold text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder-gray-800"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               {/* Filters */}
               <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar justify-center">
                  {['all', 'beat', 'preset', 'drumkit'].map(type => (
                     <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all whitespace-nowrap border ${filterType === type
                           ? 'bg-white text-black border-white shadow-2xl shadow-white/10'
                           : 'bg-black/40 text-gray-600 border-white/5 hover:border-white/10 hover:text-white'
                           }`}
                     >
                        {type === 'all' ? 'Todos' : type + 's'}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* --- CONTENT --- */}
         <div className="space-y-12 mb-20">
            {filteredHistory.length === 0 ? (
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 animate-in fade-in duration-500">
               <div className="bg-[#0A0A0A] border border-white/10 p-12 rounded-[60px] w-full max-w-lg text-center shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-500 rounded-b-full"></div>

                  <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group-hover:rotate-0 transition-transform">
                     <AlertCircle className="text-red-500" size={48} />
                  </div>

                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">¿Borrar Historial?</h3>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-12 leading-relaxed max-w-xs mx-auto">
                     Esta acción eliminará permanentemente tu registro de reproducciones. Esta acción no se puede deshacer.
                  </p>

                  <div className="flex flex-col gap-4">
                     <button
                        onClick={handleClearHistory}
                        disabled={isClearing}
                        className="w-full py-5 rounded-[24px] bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-red-500/20"
                     >
                        {isClearing ? 'Borrando...' : 'Sí, confirmar borrado'}
                     </button>
                     <button
                        onClick={() => setShowClearModal(false)}
                        className="w-full py-5 rounded-[24px] bg-white/5 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95"
                     >
                        Volver al Historial
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

function HistoryList({ items, getGroupLabel, playingId, onTogglePlay }) {
   let lastGroup = '';

   return items.map((item) => {
      const currentGroup = getGroupLabel(item.played_at);
      const showHeader = currentGroup !== lastGroup;
      lastGroup = currentGroup;

      return (
         <React.Fragment key={item.history_id}>
            {showHeader && (
               <div className="flex items-center gap-6 mb-8 mt-16 first:mt-0">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{currentGroup}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
               </div>
            )}

            <div className="group flex flex-col md:flex-row items-center gap-8 p-6 bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-500 rounded-[40px] relative overflow-hidden mb-4 last:mb-0">

               {/* Artwork / Play */}
               <div className="relative w-24 h-24 lg:w-28 lg:h-28 flex-shrink-0">
                  <img
                     src={item.image_url || 'https://via.placeholder.com/150'}
                     alt={item.name}
                     className="w-full h-full object-cover rounded-[28px] bg-black border border-white/5 group-hover:scale-105 transition-transform duration-700 shadow-2xl"
                  />
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-500 rounded-[28px] backdrop-blur-[2px] ${playingId === item.history_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                     <button
                        onClick={() => onTogglePlay(item)}
                        className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl active:scale-90"
                     >
                        {playingId === item.history_id ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                     </button>
                  </div>

                  {/* Status Indicator */}
                  {playingId === item.history_id && (
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center animate-bounce shadow-xl border-4 border-black">
                        <Music size={12} className="text-white" />
                     </div>
                  )}
               </div>

               {/* Info */}
               <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                     <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full">
                        {item.product_type}
                     </span>
                     <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                        {new Date(item.played_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <h4 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl group-hover:text-violet-400 transition-colors truncate mb-1">{item.name}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                     <User size={12} className="text-violet-500/50" /> <span className="text-gray-400 group-hover:text-white transition-colors">{item.producer_name}</span>
                  </div>
               </div>

               {/* Waveform Mockup */}
               <div className="hidden xl:flex items-center justify-center gap-[4px] h-10 flex-1 max-w-[250px] opacity-20 group-hover:opacity-50 transition-all duration-1000">
                  {[...Array(32)].map((_, i) => (
                     <div
                        key={i}
                        className={`w-[3px] rounded-full transition-all duration-700 ${playingId === item.history_id ? 'bg-violet-500 animate-pulse' : 'bg-white'}`}
                        style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}
                     ></div>
                  ))}
               </div>

               {/* Actions */}
               <div className="flex items-center gap-8 pr-4">
                  <div className="hidden md:flex flex-col items-end">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 mb-1">Desde</span>
                     <span className={`font-black text-xl tracking-tighter uppercase ${item.is_free ? 'text-emerald-500' : 'text-white'}`}>
                        {item.is_free ? 'GRATIS' : `$${item.price_basic}`}
                     </span>
                  </div>

                  <div className="h-12 w-px bg-white/5 hidden md:block"></div>

                  <button className="flex items-center gap-3 h-14 px-8 rounded-[24px] bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-violet-500 hover:text-white transition-all active:scale-95 group/cart shadow-2xl">
                     <ShoppingCart size={18} className="group-hover/cart:scale-110 transition-transform" />
                     <span className="hidden lg:inline">Adquirir</span>
                  </button>
               </div>
            </div>
         </React.Fragment>
      );
   });
}

function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-[#070707] border border-white/5 rounded-[60px] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-32 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
            <HistoryIcon size={400} />
         </div>

         <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
            <HistoryIcon className="text-gray-800" size={48} />
         </div>

         <h4 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Cronología Desierta</h4>
         <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-12 max-w-sm leading-relaxed">
            Explora el marketplace y dale play a tus tracks favoritos para comenzar a construir tu historial.
         </p>

         <Link to="/explorar" className="group flex items-center gap-3 px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95">
            Explorar Catálogo
            <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </Link>
      </div>
   );
}
