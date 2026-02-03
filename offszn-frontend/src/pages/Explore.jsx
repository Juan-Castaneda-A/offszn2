import React, { useEffect } from 'react';
import { MOCK_PRODUCTS } from '../mocks/products';
import { usePlayerStore } from '../store/playerStore';

const Explore = () => {
  const { playTrack, currentTrack, isPlaying, setPlaylist } = usePlayerStore();

  // Al cargar la página, seteamos la playlist actual con los productos visibles
  useEffect(() => {
    setPlaylist(MOCK_PRODUCTS);
  }, [setPlaylist]);

  const handlePlay = (product) => {
    if (currentTrack?.id === product.id) {
      usePlayerStore.getState().togglePlay(); // Toggle si es el mismo
    } else {
      playTrack(product);
    }
  };

  return (
    <div className="pb-32 pt-10 min-h-screen bg-black">
      {/* Hero Section Simplificado */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12">
        <div className="relative h-[300px] rounded-2xl bg-gradient-to-r from-violet-900/40 to-black border border-white/10 flex items-center p-10 overflow-hidden">
           <div className="relative z-10 max-w-2xl">
              <span className="text-violet-400 text-xs font-bold tracking-widest uppercase bg-violet-500/10 px-3 py-1 rounded-full mb-4 inline-block">
                Trending Ahora
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-display">
                ENCUENTRA TU <br/>PRÓXIMO HIT
              </h1>
              <p className="text-zinc-400 mb-8 max-w-lg">
                Explora miles de beats, drum kits y loops creados por los mejores productores de la industria.
              </p>
           </div>
           {/* Decoración abstracta */}
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-2xl font-bold text-white mb-6 font-display">Nuevos Lanzamientos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen & Overlay de Play */}
              <div className="relative aspect-square">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Play Button */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${currentTrack?.id === product.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button 
                    onClick={() => handlePlay(product)}
                    className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                  >
                     {currentTrack?.id === product.id && isPlaying ? (
                       <i className="bi bi-pause-fill text-xl"></i>
                     ) : (
                       <i className="bi bi-play-fill text-xl ml-1"></i>
                     )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate">{product.name}</h3>
                <p className="text-zinc-500 text-xs mb-3">{product.producer_name}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${product.is_free ? 'text-green-500' : 'text-violet-300'}`}>
                    {product.is_free ? 'FREE' : `$${product.price_basic}`}
                  </span>
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <i className="bi bi-cart-plus text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;