import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { usePlayerStore } from '../store/playerStore';
import { useCartStore } from '../store/cartStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useAuth } from '../store/authStore';
import { useChatStore } from '../store/useChatStore';
import { BiPlay, BiPause, BiCartAdd, BiInfoCircle, BiHeart, BiShareAlt, BiCheck, BiDownload } from 'react-icons/bi';
import { BsPatchCheckFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState('basic');

  // Stores
  const addToCart = useCartStore(state => state.addToCart);
  const { formatPrice } = useCurrencyStore();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { user } = useAuth();
  const { startNewChat } = useChatStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/products/${id}`);
        const found = response.data;

        if (found) {
          setProduct({
            ...found,
            available_licenses: [
              { id: 'basic', name: 'Basic Lease', price: found.price_basic, features: ['MP3', '5,000 Streams'] },
              { id: 'premium', name: 'Premium Lease', price: found.price_premium || (found.price_basic + 20), features: ['MP3', 'WAV', '50,000 Streams'] },
              { id: 'unlimited', name: 'Unlimited', price: found.price_exclusive || (found.price_basic + 80), features: ['MP3', 'WAV', 'STEMS', 'Ilimitado'] }
            ].filter(l => l.price > 0 || found.is_free)
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
      <button onClick={() => navigate(-1)} className="text-violet-400 hover:underline">Volver</button>
    </div>
  );

  const isCurrent = currentTrack?.id === product.id;
  const activeLicense = product.available_licenses.find(l => l.id === selectedLicense) || product.available_licenses[0];

  const handlePlay = (e) => {
    e?.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(product); // Asegúrate que 'product' tenga audio_url o demo_url
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedLicense);
    // El toast ya lo maneja el store, pero por si acaso:
    // toast.success(`Añadido: ${product.name}`);
  };

  // Fondo borroso dinámico
  const bgStyle = {
    backgroundImage: `url(${product.image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">

      {/* --- HERO SECTION CON BLUR --- */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <div className="absolute inset-0 blur-3xl opacity-30 scale-110" style={bgStyle}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-end pb-12 gap-8">

          {/* Portada */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl shadow-2xl overflow-hidden border border-white/10 relative">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              {/* Botón Play Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={handlePlay} className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                  {isCurrent && isPlaying ? <BiPause size={40} /> : <BiPlay size={40} className="ml-1" />}
                </button>
              </div>
            </div>
          </div>

          {/* Info Principal */}
          <div className="flex-1 mb-2 md:mb-0 w-full overflow-hidden">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-2">
              <span className="px-2 py-1 bg-white/10 rounded text-xs uppercase tracking-wider text-white">
                {product.product_type || 'Beat'}
              </span>
              <span>{product.bpm ? `${product.bpm} BPM` : ''}</span>
              <span>•</span>
              <span>{product.key || 'Key N/A'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-2 truncate" title={product.name}>
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-lg text-gray-300">
              <span className="text-gray-500">Por</span>
              <Link to={`/u/${product.users?.nickname || product.producer_nickname}`} className="text-violet-400 hover:text-white transition font-bold flex items-center gap-1">
                {product.users?.nickname || product.producer_nickname || 'Productor'}
                {product.users?.is_verified && <BsPatchCheckFill size={14} className="text-blue-500" />}
              </Link>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex gap-3 mb-2">
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition text-gray-300">
              <BiHeart size={24} />
            </button>
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition text-gray-300">
              <BiShareAlt size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Columna Izquierda (Detalles y Descripción) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-[#1a1a1a] text-gray-400 text-xs font-bold rounded-full border border-white/5 hover:border-violet-500/50 transition cursor-default">
                  #{typeof tag === 'string' ? tag.trim() : tag}
                </span>
              ))}
            </div>
          )}

          {/* Descripción */}
          <div className="bg-[#111] rounded-2xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BiInfoCircle className="text-violet-500" /> Información
            </h3>
            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-line">
              {product.description || "El productor no ha añadido una descripción para este beat."}
            </div>
          </div>

          {/* Stats o Extra Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha</div>
              <div className="text-white font-medium">{new Date(product.created_at).toLocaleDateString()}</div>
            </div>
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Plays</div>
              <div className="text-white font-medium">{product.plays_count || 0}</div>
            </div>
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Descargas</div>
              <div className="text-white font-medium">{product.downloads_count || 0}</div>
            </div>
            {/* ... más stats */}
          </div>
        </div>

        {/* Columna Derecha (LICENCIAS y COMPRA) - STICKY */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-6 text-gray-200">Selecciona Licencia</h3>

            <div className="space-y-3 mb-8">
              {product.available_licenses?.map((lic) => (
                <div
                  key={lic.id}
                  onClick={() => setSelectedLicense(lic.id)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${selectedLicense === lic.id
                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border-white/10 hover:border-white/20 bg-black/40'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${selectedLicense === lic.id ? 'text-white' : 'text-gray-300'}`}>
                      {lic.name}
                    </span>
                    <span className="font-mono font-bold text-violet-400">
                      {formatPrice(lic.price)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                    {lic.features.map((f, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <BiCheck size={12} className="text-green-500" /> {f}
                      </span>
                    ))}
                  </div>

                  {/* Radio Indicator */}
                  <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center ${selectedLicense === lic.id ? 'border-violet-500 bg-violet-500' : 'border-gray-600'
                    }`}>
                    {selectedLicense === lic.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Botón Principal de Acción */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-violet-900/20 active:scale-95"
              >
                <BiCartAdd size={24} />
                <span>Añadir al Carrito</span>
                <span className="bg-black/20 px-2 py-0.5 rounded text-sm ml-1 font-mono">
                  {formatPrice(activeLicense?.price || 0)}
                </span>
              </button>

              {product.is_free && (
                <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium rounded-xl flex items-center justify-center gap-2 transition">
                  <BiDownload size={20} /> Descargar Demo
                </button>
              )}
            </div>

            <p className="text-center text-xs text-gray-600 mt-4">
              Transacción segura y entrega inmediata.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;