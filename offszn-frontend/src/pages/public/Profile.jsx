import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiClient } from "../../api/client";
import { useCurrencyStore } from '../../store/currencyStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuth } from '../../store/authStore';
import { useChatStore } from '../../store/useChatStore';
import { useCartStore } from '../../store/cartStore';
import { BiPlay, BiPause, BiErrorCircle, BiMusic, BiCheckCircle } from 'react-icons/bi';
import { FaInstagram, FaYoutube, FaSpotify, FaDiscord, FaTwitter, FaTiktok } from 'react-icons/fa';
import { CheckCircle2, Heart, Share2, Globe, Search, Download, MessageSquare, UserPlus, Music2, Play, ChevronLeft, ChevronRight, ShoppingCart, Info, MoreHorizontal, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [filter, setFilter] = useState('popular');

  const { formatPrice } = useCurrencyStore();
  const { playTrack, currentTrack, isPlaying, setPlaylist } = usePlayerStore();
  const { user: currentUser } = useAuth();
  const { startNewChat } = useChatStore();
  const themeColor = profile?.theme_color || '#8b5cf6';

  const handleMessageClick = async () => {
    if (!currentUser) {
      toast.error("Inicia sesión para enviar mensajes");
      return;
    }
    await startNewChat(profile, currentUser);
    navigate('/mensajes');
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await apiClient.get(`/users/${username}`);
        const user = userRes.data;
        setProfile(user);

        const prodRes = await apiClient.get('/products', { params: { nickname: username } });
        const userProducts = prodRes.data;
        setProducts(userProducts || []);
        setPlaylist(userProducts || []);

      } catch (err) {
        console.error(err);
        setError("No pudimos cargar este perfil. Puede que no exista.");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username, setPlaylist]);

  // Handle play globally
  const handlePlay = (product) => {
    if (currentTrack?.id === product.id) {
      usePlayerStore.getState().togglePlay();
    } else {
      playTrack(product);
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#888] bg-[#050505]">
      <BiErrorCircle size={48} className="mb-4 text-red-500/50" />
      <h2 className="text-xl font-bold text-white">Ops, algo salió mal</h2>
      <p>{error}</p>
      <Link to="/explorar" className="mt-6 text-violet-500 hover:underline">Volver a explorar</Link>
    </div>
  );

  // Derived Data
  const trendingProducts = products.slice(0, 5); // Take top 5 for trending
  const filteredProducts = products.filter(p => {
    if (filter === 'popular' || filter === 'all') return true;
    return p.product_type?.toLowerCase().includes(filter);
  });

  // Theme color for global background effect (Fallback to an orange matching screenshot)
  // -- Legacy Banner Parser --
  const getBannerStyle = () => {
    const val = profile?.banner_url;
    if (!val) return { background: `linear-gradient(180deg, ${themeColor} 0%, #000 100%)` };

    if (val.startsWith('url:') || val.startsWith('gif:')) {
      const url = val.substring(val.indexOf(':') + 1);
      return { background: `url("${url}") center/cover no-repeat` };
    } else if (val.startsWith('solid:')) {
      const color = val.substring(val.indexOf(':') + 1);
      return { background: color };
    } else if (val.startsWith('gradient:')) {
      const gradient = val.substring(val.indexOf(':') + 1);
      return { background: gradient };
    } else if (val.startsWith('http')) {
      return { background: `url("${val}") center/cover no-repeat` };
    }
    return { background: `linear-gradient(180deg, ${themeColor} 0%, #000 100%)` };
  };

  return (
    <div className="w-full min-h-screen font-sans selection:bg-violet-500/30 pb-32">

      {/* GLOBAL STYLE INJECTION FOR THEME BACKGROUND OVERRIDE */}
      <style>
        {`
          body {
             background: radial-gradient(120% 60% at 50% 0%, ${themeColor}60 0%, #050505 60%, #050505 100%) !important;
             background-color: #050505 !important;
             background-attachment: fixed !important;
          }
          footer {
             background: transparent !important;
             border-top: none !important;
          }
        `}
      </style>

      {/* 1. HEADER / BANNER */}
      <header
        className="relative pt-[100px] px-10 pb-16 min-h-[380px] overflow-hidden"
        style={getBannerStyle()}
      >
        {/* Dynamic Theme Wash Effect (from legacy CSS) */}
        {!profile?.banner_url && (
          <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.2]"
              style={{
                background: `radial-gradient(circle at 50% -10%, ${themeColor} 0%, transparent 100%)`
              }}
            />
            <div
              className="absolute inset-0 z-2"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 15%, rgba(0,0,0,0.3) 30%, transparent 50%)'
              }}
            />
          </div>
        )}

        {/* Action Buttons (Absolute Positioned in Legacy) */}
        <div className="absolute right-10 bottom-8 flex items-center gap-3 z-20">
          <button className="bg-transparent border border-white/40 text-white px-[18px] py-2 rounded-[20px] text-[0.75rem] font-bold flex items-center gap-2 hover:bg-white/10 hover:border-white/80 transition-all hover:-translate-y-[2px]">
            Seguir
          </button>
          {!currentUser || (currentUser && currentUser.id !== profile?.id) ? (
            <button
              onClick={handleMessageClick}
              className="bg-transparent border border-white/40 text-white px-[18px] py-2 rounded-[20px] text-[0.75rem] font-bold flex items-center gap-2 hover:bg-white/10 hover:border-white/80 transition-all hover:-translate-y-[2px]"
            >
              Mensaje
            </button>
          ) : null}
        </div>

        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-end gap-8 relative z-10 w-full">

          {/* Avatar Area */}
          <div className="profile-avatar-container shrink-0">
            <div className="w-[175px] h-[175px] rounded-full bg-[#1a1a1a] overflow-hidden border-[4px] border-[#1a1a1a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.nickname}&background=1a1a1a&color=fff&size=300`}
                alt={profile?.nickname}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Area */}
          <div className="profile-details flex-1 flex flex-col gap-2 pb-2">

            <div className="flex items-center gap-3">
              <h1 className="text-[3rem] font-black text-white leading-none tracking-[-1.2px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] font-['Plus_Jakarta_Sans',sans-serif]">
                {profile?.nickname}
              </h1>
              {profile?.is_verified && (
                <div className="relative group flex items-center mt-1">
                  <div className="text-[#3b82f6] text-[1.5rem] cursor-help">
                    <BiCheckCircle />
                  </div>
                  {/* Legacy Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:flex flex-col w-[200px] bg-[#1a1a1a] border border-[#333] rounded-[10px] p-0 z-50 shadow-[0_10px_25px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-200">
                    <div className="bg-[#222] px-3 py-2 rounded-t-[10px] text-[0.7rem] font-bold text-white border-b border-[#333] flex items-center gap-1.5 uppercase tracking-wide">
                      <BiCheckCircle className="text-[#3b82f6] text-[0.9rem]" /> VERIFICADO OFFSZN
                    </div>
                    <div className="p-3 text-[0.85rem] text-gray-300 leading-tight">
                      Plan Premium OFFSZN<br />
                      Productor Verificado<br />
                      <span className="text-[#888] text-[0.7rem] block mt-1">Certificado Oficial</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1a1a1a]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#b3b3b3] text-[0.85rem] font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              <span>{profile?.role || 'Productor Musical'}</span>
              <span className="text-[0.5rem]">•</span>
              <span>{profile?.location || 'Mundo'}</span>
            </div>

            <div className="text-[#ccc] text-[1rem] leading-[1.5] max-w-[600px] mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] whitespace-pre-line break-words">
              {profile?.bio || "Aún no ha añadido información."}
            </div>

            <div className="flex items-center gap-10 mt-2">
              <div className="flex items-center gap-5 text-[#b3b3b3] text-[0.9rem]">
                <span><b className="text-white font-bold">{products.length}</b> tracks</span>
                <span><b className="text-white font-bold">0</b> followers</span>
                <span><b className="text-white font-bold">0</b> following</span>
              </div>

              <div className="flex items-center gap-4 pl-5 border-l border-white/10">
                <SocialLinkSmall href={profile?.socials?.instagram} icon={FaInstagram} />
                <SocialLinkSmall href={profile?.socials?.youtube} icon={FaYoutube} />
                <SocialLinkSmall href={profile?.socials?.tiktok} icon={FaTiktok} />
              </div>
            </div>

            {/* Profile Action Tabs - Horizontal like legacy */}
            <div className="flex gap-8 mt-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`text-[0.8rem] font-bold tracking-widest uppercase py-3 px-1 transition-all relative ${activeTab === 'products' ? 'text-white' : 'text-[#ccc] hover:text-white'}`}
              >
                PRODUCTOS
                {activeTab === 'products' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>}
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`text-[0.8rem] font-bold tracking-widest uppercase py-3 px-1 transition-all relative ${activeTab === 'services' ? 'text-white' : 'text-[#ccc] hover:text-white'}`}
              >
                SERVICIOS
                {activeTab === 'services' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`text-[0.8rem] font-bold tracking-widest uppercase py-3 px-1 transition-all relative ${activeTab === 'about' ? 'text-white' : 'text-[#ccc] hover:text-white'}`}
              >
                INFO
                {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>}
              </button>
            </div>
          </div>

          {/* Action Buttons (Absolute Positioned in Legacy but here relative for ease) */}
          <div className="flex items-center gap-3 pb-8">
            <button className="bg-transparent border border-white/40 text-white px-[18px] py-2 rounded-[20px] text-[0.75rem] font-bold flex items-center gap-2 hover:bg-white/10 hover:border-white/80 transition-all hover:-translate-y-[2px]">
              Seguir
            </button>
            <button
              onClick={handleMessageClick}
              className="bg-transparent border border-white/40 text-white px-[18px] py-2 rounded-[20px] text-[0.75rem] font-bold flex items-center gap-2 hover:bg-white/10 hover:border-white/80 transition-all hover:-translate-y-[2px]"
            >
              Mensaje
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-[1400px] mx-auto px-6 mt-12 bg-black/40 backdrop-blur-xl p-8 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">

        {activeTab === 'products' && (
          <>
            {/* FEATURED / TRENDING (Packs Style) */}
            <div className="section-header flex items-center justify-between mb-5">
              <h3 className="text-white text-[1.25rem] font-bold">Trending / Packs</h3>
              <div className="nav-arrows flex gap-2">
                <button className="bg-[#111] border border-[#222] w-8 h-8 rounded-full text-[#555] flex items-center justify-center hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="bg-[#111] border border-[#222] w-8 h-8 rounded-full text-[#555] flex items-center justify-center hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div id="trendingGrid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              {trendingProducts.map(p => (
                <TrendingCard
                  key={p.id}
                  product={p}
                  profile={profile}
                  isPlaying={currentTrack?.id === p.id && isPlaying}
                  onPlay={() => handlePlay(p)}
                />
              ))}
            </div>

            {/* PRO TOOLBAR (Reference Match) */}
            <div className="pro-toolbar-container flex justify-between items-center bg-[#080808] border border-[#1a1a1a] rounded-lg h-14 p-0 mb-6">
              <div className="toolbar-section left flex items-center h-full">
                <div className="dropdown-wrapper h-full flex items-center border-r border-[#1a1a1a] px-5">
                  <button className="flex items-center gap-2 text-[#eab308] text-[0.8rem] font-bold uppercase tracking-wider">
                    <span className="text-xs">🔥</span> POPULAR <ChevronDown size={14} />
                  </button>
                </div>
                <div className="filters-row flex items-center h-full">
                  <FilterTab label="DRUM KITS" active={filter === 'drum kit'} onClick={() => setFilter('drum kit')} />
                  <FilterTab label="LOOPS" active={filter === 'loop kit'} onClick={() => setFilter('loop kit')} />
                  <FilterTab label="PRESETS" active={filter === 'preset'} onClick={() => setFilter('preset')} />
                  <FilterTab label="BEATS" active={filter === 'beat'} onClick={() => setFilter('beat')} />
                  <FilterTab label="ALL" active={filter === 'all'} onClick={() => setFilter('all')} />
                </div>
              </div>

              <div className="toolbar-section right px-4">
                <div className="pro-search relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none text-white text-sm outline-none w-40 md:w-64"
                  />
                  <Search size={14} className="text-[#555] ml-2" />
                </div>
              </div>
            </div>

            {/* MAIN TRACK LIST */}
            <div className="products-list-container flex flex-col gap-0">
              {filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                filteredProducts.map(product => (
                  <TrackListRow
                    key={product.id}
                    product={product}
                    producerName={profile?.nickname}
                    isPlaying={currentTrack?.id === product.id && isPlaying}
                    isCurrent={currentTrack?.id === product.id}
                    onPlay={() => handlePlay(product)}
                    formatPrice={formatPrice}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <div className="services-container mt-5">
            {profile?.socials?.offered_services?.mixing || profile?.socials?.offered_services?.mastering ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {profile.socials.offered_services.mixing && (
                  <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
                    <div className="text-[2rem] text-[#8b5cf6] block mb-3">🎤</div>
                    <h4 className="text-white mb-1 font-bold">Servicio de Mezcla</h4>
                    <p className="text-[#666] text-[0.8rem]">Mezcla profesional para tus tracks.</p>
                  </div>
                )}
                {profile.socials.offered_services.mastering && (
                  <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
                    <div className="text-[2rem] text-[#10b981] block mb-3">🎧</div>
                    <h4 className="text-white mb-1 font-bold">Servicio de Mastering</h4>
                    <p className="text-[#666] text-[0.8rem]">El toque final para un sonido comercial.</p>
                  </div>
                )}
                <div
                  className="bg-[#181818] border border-dashed border-[#333] p-6 rounded-xl text-center flex flex-col justify-center items-center cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={handleMessageClick}
                >
                  <MessageSquare className="text-[1.5rem] text-[#555] mb-2" />
                  <span className="text-[#888] text-[0.85rem] font-bold">Contactar ahora</span>
                </div>
              </div>
            ) : (
              <div className="empty-state py-10 px-5 text-center bg-[#111] rounded-xl border border-[#222] mb-8">
                <p className="text-[#666] m-0">Este usuario no ofrece servicios listados actualmente.</p>
              </div>
            )}

            {profile?.socials?.spotify_content && (
              <div className="mt-8">
                <h4 className="text-white mb-4 text-[0.9rem] uppercase tracking-widest flex items-center gap-2 font-bold">
                  <span className="text-[#1DB954]"><FaSpotify size={18} /></span> Mi Portfolio / Playlist
                </h4>
                <iframe
                  title="Spotify Embed"
                  className="rounded-xl w-full h-[380px] bg-[#111]"
                  src={
                    profile.socials.spotify_content.includes('playlist/')
                      ? `https://open.spotify.com/embed/playlist/${profile.socials.spotify_content.split('playlist/')[1]?.split('?')[0]}?utm_source=generator&theme=0`
                      : profile.socials.spotify_content.includes('track/')
                        ? `https://open.spotify.com/embed/track/${profile.socials.spotify_content.split('track/')[1]?.split('?')[0]}?utm_source=generator&theme=0`
                        : ""
                  }
                  frameBorder="0"
                  allowFullScreen=""
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 mt-5">
            <div className="about-card bg-[#111] p-6 rounded-xl border border-[#222]">
              <h4 className="text-[#8b5cf6] mb-3 text-[0.8rem] uppercase tracking-wide font-bold">Biografía</h4>
              <p className="text-[#ccc] leading-relaxed text-[0.95rem] whitespace-pre-wrap">
                {profile?.bio || "Sin biografía disponible."}
              </p>
            </div>
            <div className="about-card bg-[#111] p-6 rounded-xl border border-[#222]">
              <h4 className="text-[#8b5cf6] mb-5 text-[0.8rem] uppercase tracking-wide font-bold">Detalles</h4>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                  <span className="text-[#666] text-[0.85rem]">Experiencia</span>
                  <span className="text-white font-semibold text-[0.9rem]">
                    {profile?.experience ? profile.experience[0] : 'No especificada'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                  <span className="text-[#666] text-[0.85rem]">DAW Principal</span>
                  <span className="text-white font-semibold text-[0.9rem]">
                    {profile?.daws && profile.daws.length > 0 ? profile.daws[0] : 'No especificado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-[0.85rem]">Miembro desde</span>
                  <span className="text-white font-semibold text-[0.9rem]">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function SocialLinkSmall({ href, icon: Icon }) {
  if (!href) return null;
  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noreferrer"
      className="text-[#b3b3b3] hover:text-white transition-colors"
    >
      <Icon size={18} />
    </a>
  );
}

function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-full border-r border-[#1a1a1a] px-6 text-[0.75rem] font-bold uppercase tracking-widest transition-all ${active ? 'bg-[#111] text-white' : 'text-[#777] hover:bg-[#111] hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function TrendingCard({ product, profile, isPlaying, onPlay }) {
  const productUrl = `/${product.product_type || 'beat'}/${product.public_slug || product.id}`;

  return (
    <Link to={productUrl} className="group flex flex-col gap-2 cursor-pointer">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#121212] shadow-lg">
        <img
          src={product.image_url || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isPlaying ? 'opacity-100' : ''}`}>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
            {isPlaying ? <BiPause size={28} /> : <BiPlay size={28} className="ml-1" />}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 mt-1">
        <h4 className="text-white text-[0.95rem] font-bold truncate leading-tight">{product.name}</h4>
        <p className="text-[#b3b3b3] text-[0.8rem] truncate">{profile?.nickname || 'Productor'}</p>
        <p className="text-[#555] text-[0.7rem] font-bold uppercase tracking-wider mt-0.5">
          {product.product_type || 'Pack'} • {product.bpm || '120'} BPM
        </p>
      </div>
    </Link>
  );
}

function FilterPill({ children, active, onClick }) {
  if (active) return null;
  return (
    <button
      onClick={onClick}
      className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
    >
      {children}
    </button>
  );
}

function TrackListRow({ product, producerName, isCurrent, isPlaying, onPlay, formatPrice }) {
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const isFree = product.is_free;
  const priceBasic = product.price_basic || 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`Añadido: ${product.name}`);
  };

  const goToProduct = (e) => {
    e.stopPropagation();
    const productUrl = `/${product.product_type || 'beat'}/${product.public_slug || product.id}`;
    navigate(productUrl);
  }

  return (
    <div
      onClick={onPlay}
      className="group grid grid-cols-[44px_36px_1.2fr_40px_2.2fr_1fr_130px] items-center gap-4 py-2 px-2 border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-all cursor-pointer overflow-hidden"
    >
      {/* 1. Cover Art */}
      <div className="w-[44px] h-[44px] rounded-[4px] overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/5">
        <img src={product.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover brightness-[0.9]" alt="" />
      </div>

      {/* 2. Play Button */}
      <div className="flex justify-center shrink-0">
        <button className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#333] hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-white transition-all transform hover:scale-105">
          {isCurrent && isPlaying ? <BiPause size={20} /> : <BiPlay size={20} className="ml-0.5" />}
        </button>
      </div>

      {/* 3. Waveform */}
      <div className="hidden md:flex items-center w-full px-1 opacity-80 group-hover:opacity-100">
        <div className="flex items-center gap-[1.5px] h-6 w-full">
          {[...Array(40)].map((_, j) => {
            const height = Math.random() * 60 + 20;
            return (
              <div
                key={j}
                className={`w-[1.5px] rounded-full transition-all ${isCurrent && isPlaying ? 'bg-violet-500 animate-pulse' : 'bg-[#555]'}`}
                style={{ height: `${height}%` }}
              ></div>
            )
          })}
        </div>
      </div>

      {/* 4. Duration */}
      <div className="text-[0.8rem] text-[#555] font-mono whitespace-nowrap">
        {product.duration || '02:45'}
      </div>

      {/* 5. Title & Author */}
      <div className="flex flex-col min-w-0 pr-2">
        <h4 className="text-[0.8rem] font-semibold text-[#eee] group-hover:text-white truncate leading-tight">
          {product.name}
        </h4>
        <p className="text-[0.65rem] text-[#444] truncate mt-0.5">
          {producerName || 'OFFSZN'}
        </p>
      </div>

      {/* 6. Tags/Badges */}
      <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
        <span className="border border-[#333] rounded-[3px] px-1.5 py-0.5 text-[0.65rem] text-[#888] font-bold uppercase tracking-wider">WAV</span>
        <span className="border border-[#333] rounded-[3px] px-1.5 py-0.5 text-[0.65rem] text-[#888] font-bold uppercase tracking-wider">STEMS</span>
      </div>

      {/* 7. Price & Actions */}
      <div className="flex items-center justify-end gap-3 ml-auto">
        <div className="hidden lg:flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); }} className="text-[#888] hover:text-white transition-colors">
            <Heart size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="text-[#888] hover:text-white transition-colors">
            <Download size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="text-[#888] hover:text-white transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="text-[0.85rem] font-extrabold text-white text-right hover:text-violet-400 transition-colors px-2"
        >
          {isFree ? 'FREE' : formatPrice(priceBasic)}
        </button>
      </div>
    </div>
  );
}

function SocialLinksSmall({ socials }) {
  if (!socials) return null;
  const platforms = ['tiktok', 'youtube', 'instagram'];
  return (
    <div className="flex gap-4 items-center">
      {platforms.map(p => {
        if (!socials[p]) return null;
        const Icon = p === 'instagram' ? FaInstagram : p === 'tiktok' ? FaTiktok : FaYoutube;
        return (
          <a key={p} href={`https://${p}.com/${socials[p].replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-gray-400 flex items-center gap-1.5 mix-blend-screen drop-shadow-sm">
            <Icon size={18} />
          </a>
        )
      })}
    </div>
  )
}

function SocialLinksList({ socials }) {
  if (!socials) return <p className="text-sm text-gray-500">No hay enlaces disponibles.</p>;

  const getIconAndUrl = (platform, handle) => {
    let url = handle;
    if (!handle.startsWith('http')) {
      if (platform === 'instagram') url = `https://instagram.com/${handle.replace('@', '')}`;
      if (platform === 'tiktok') url = `https://tiktok.com/@${handle.replace('@', '')}`;
      if (platform === 'twitter') url = `https://twitter.com/${handle}`;
      if (platform === 'youtube') url = handle.includes('youtube') ? handle : `https://youtube.com/@${handle}`;
    }

    const icons = {
      instagram: <FaInstagram />,
      youtube: <FaYoutube />,
      spotify: <FaSpotify />,
      discord: <FaDiscord />,
      twitter: <FaTwitter />,
      tiktok: <FaTiktok />
    };

    return { icon: icons[platform] || <Globe />, url };
  };

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(socials).map(([platform, handle]) => {
        if (!handle || typeof handle !== 'string') return null;
        const { icon, url } = getIconAndUrl(platform, handle);

        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            <span className="text-xl w-6 text-center">{icon}</span>
            <span className="text-sm font-bold capitalize">{platform}</span>
          </a>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-2xl bg-black/40 backdrop-blur-sm mt-4">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Music2 className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-2xl font-black text-white mb-2 tracking-wide">Aún no hay música</h3>
      <p className="text-gray-500 font-medium max-w-sm text-center">
        Este productor está trabajando en su próximo gran lanzamiento en el cuarto oscuro. Vuelve pronto.
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#050505] animate-pulse">
      <div className="w-full h-screen bg-[#050505] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mt-28 relative z-10 flex gap-10">
          <div className="w-[260px] h-[260px] rounded-full bg-white/5 border border-white/10 shrink-0"></div>
          <div className="flex flex-col justify-end pb-8">
            <div className="h-14 w-[400px] bg-white/5 rounded-md mb-4"></div>
            <div className="h-6 w-48 bg-white/5 rounded-md mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
