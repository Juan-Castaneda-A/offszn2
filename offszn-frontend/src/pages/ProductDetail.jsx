import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useSecureUrl } from '../hooks/useSecureUrl';
import { usePlayerStore } from '../store/playerStore';
import { useCartStore } from '../store/cartStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useAuth } from '../store/authStore';
import { useFavorites } from '../hooks/useFavorites';
import WaveSurfer from 'wavesurfer.js';
import ShareModal from '../components/modals/ShareModal';
import ExclusivityModal from '../components/modals/ExclusivityModal';
import ComparisonModal from '../components/modals/ComparisonModal';
import ProducerHoverCard from '../components/profile/ProducerHoverCard';
import { Music2, ShoppingCart, Rocket } from 'lucide-react';
import { BiPlay, BiPause, BiHeart, BiShareAlt, BiCheck, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsPatchCheckFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id, slug } = useParams();
  const identifier = slug || id;
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState('basic');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExclusivityModalOpen, setIsExclusivityModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Negotiation State
  const { user } = useAuth();
  const [negotiateAmount, setNegotiateAmount] = useState('');
  const [negotiateEmail, setNegotiateEmail] = useState(user?.email || '');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [isSubmittingNegotiation, setIsSubmittingNegotiation] = useState(false);

  const { toggleFavorite } = useFavorites();
  const tabsNavRef = useRef(null);
  const tabIndicatorRef = useRef(null);
  const trendingGridRef = useRef(null);

  // Hover Card State
  const [hoveredProducer, setHoveredProducer] = useState(null);
  const [hoverRect, setHoverRect] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Stores
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { url: secureAudioUrl } = useSecureUrl(product?.audio_url || product?.demo_url);
  const { url: secureImageUrl } = useSecureUrl(product?.image_url);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/products/${identifier}`);
        const found = response.data;

        if (found) {
          setProduct({
            ...found,
            available_licenses: [
              { id: 'basic', name: 'Basic Lease', price: found.price_basic, features: ['MP3 de Alta Calidad', '5,000 Streams', 'Sin Monetización'] },
              { id: 'premium', name: 'Premium Lease', price: found.price_premium || (found.price_basic + 20), features: ['MP3 + WAV', '50,000 Streams', 'Monetización Limitada'] },
              { id: 'unlimited', name: 'Unlimited Trackout', price: found.price_exclusive || (found.price_basic + 80), features: ['MP3 + WAV + TRACKOUTS', 'Streams Ilimitados', 'Monetización Ilimitada'] }
            ].filter(l => l.price > 0 || found.is_free),
            likes_count: (Number(found.likes_count || 0) === 0 && found.is_liked) ? 1 : Number(found.likes_count || 0)
          });
          setIsLiked(!!found.is_liked);

          // Update email if user is logged in
          if (user?.email) setNegotiateEmail(user.email);

          // Fetch related products
          apiClient.get(`/products?limit=10&product_type=${found.product_type}`)
            .then(res => {
              const filtered = res.data.filter(p => p.id !== found.id);
              setRelatedProducts(filtered.slice(0, 6));
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
  }, [identifier, user]);

  useEffect(() => {
    // Update tab indicator position
    const activeTabEl = tabsNavRef.current?.querySelector('.tab-btn.active');
    if (activeTabEl && tabIndicatorRef.current) {
      tabIndicatorRef.current.style.width = `${activeTabEl.offsetWidth}px`;
      tabIndicatorRef.current.style.left = `${activeTabEl.offsetLeft}px`;
    }
  }, [activeTab]);

  useEffect(() => {
    if (user && product?.id) {
      apiClient.post('/activity/record', {
        entity_id: product.id,
        entity_type: 'product'
      }).catch(() => { });
    }
  }, [product?.id, user]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
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
      playTrack({ ...product, secureAudio: secureAudioUrl });
      if (user) {
        apiClient.post('/activity/record', {
          entity_id: product.id,
          entity_type: 'listen'
        }).catch(() => { });
      }
    }
  };

  const handleAddToCart = () => {
    addItem(product, activeLicense);
    toast.success(`Añadido: ${product.name}`);
  };

  const handleLike = async () => {
    const result = await toggleFavorite(product.id);
    if (result !== null) {
      setIsLiked(result);
      setProduct(prev => ({
        ...prev,
        likes_count: result ? (Number(prev.likes_count || 0) + 1) : Math.max(0, Number(prev.likes_count || 0) - 1)
      }));
    }
  };

  const scrollRelated = (direction) => {
    if (!trendingGridRef.current) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    trendingGridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleProducerEnter = (e, nickname, isVerified) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverRect(rect);
    setHoveredProducer({ nickname, isVerified });
  };

  const handleProducerLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProducer(null);
      setHoverRect(null);
    }, 300);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleSubmitNegotiation = async (e) => {
    e.preventDefault();
    if (!negotiateAmount || !negotiateEmail) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setIsSubmittingNegotiation(true);
      await apiClient.post('/negotiations', {
        product_id: product.id,
        buyer_email: negotiateEmail,
        offered_amount: parseFloat(negotiateAmount),
        message: negotiateMessage
      });
      toast.success("¡Oferta enviada con éxito! El productor revisará tu propuesta pronto.");
      setNegotiateAmount('');
      setNegotiateMessage('');
    } catch (err) {
      console.error("Error submitting negotiation:", err);
      toast.error("No se pudo enviar la oferta. Reintenta más tarde.");
    } finally {
      setIsSubmittingNegotiation(false);
    }
  };

  return (
    <div className="product-detail-page selection:bg-violet-500/30">

      {/* --- MOBILE HEADER (TITLE/PRODUCER) --- */}
      <div className="px-4 md:px-10 lg:hidden mb-6">
        <h1 className="text-3xl font-black leading-tight mb-2 tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
          <span>Por</span>
          <Link to={`/@${product.users?.nickname}`} className="text-white hover:text-primary transition-colors flex items-center gap-1">
            {product.users?.nickname}
            {product.users?.is_verified && <BsPatchCheckFill className="text-primary w-3.5 h-3.5" />}
          </Link>
        </div>
      </div>

      <div className="product-split-layout">

        {/* --- LEFT COL: SIDEBAR (IMAGE & INFO) --- */}
        <aside className="product-sidebar">
          <div className="product-cover-art" style={{ position: 'relative' }}>
            <img
              src={secureImageUrl || '/images/portada-default.png'}
              alt={product.name}
              id="product-main-art"
            />
            <div className="product-cover-play-btn" onClick={handlePlay}>
              {isCurrent && isPlaying ? <BiPause className="text-8xl" /> : <BiPlay className="text-8xl" />}
            </div>
            <div className="product-cover-badge">
              <Music2 size={14} /> {product.plays_count || 0}
            </div>
          </div>

          {/* Social Actions (Mobile: Below Image / Desktop: Sidebar) */}
          <div className="social-actions-wrapper">
            <button onClick={handleLike} className={clsx("action-btn-icon", isLiked && "liked text-red-500")}>
              <BiHeart className={clsx("w-6 h-6", isLiked ? "fill-current" : "")} />
              <span className="stat-value">{product.likes_count || 0}</span>
            </button>
            <button onClick={handleShare} className="action-btn-icon">
              <BiShareAlt className="w-6 h-6" />
              <span className="stat-value uppercase">Compartir</span>
            </button>
            <button onClick={() => setIsExclusivityModalOpen(true)} className="action-btn-icon">
              <div className="w-6 h-6 flex items-center justify-center font-black border-2 border-current rounded-md text-[10px]">EX</div>
              <span className="stat-value uppercase">Exclusiva</span>
            </button>
          </div>

          {/* Info List Section */}
          <div className="info-list-container space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Detalles Técnicos</h4>
            <div className="divide-y divide-white/5">
              <InfoRow label="Lanzamiento" val={new Date(product.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <InfoRow label="Categoría" val={product.product_type} isCapitalized />
              {product.product_type === 'beat' && (
                <>
                  <InfoRow label="BPM" val={product.bpm || '--'} />
                  <InfoRow label="Key" val={`${product.key || '--'} ${product.key_scale || ''}`} />
                </>
              )}
              <InfoRow label="Reproducciones" val={product.plays_count || 0} />
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              {product.tags && (Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, i) => (
                <Link key={i} to={`/explorar?tag=${tag.trim()}`} className="tag-pill">
                  #{tag.trim()}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* --- RIGHT COL: MAIN CONTENT (BUYING & TABS) --- */}
        <main className="product-main-content">
          {/* DESKTOP HEADER (TITLE/PRODUCER) */}
          <div className="hidden lg:block product-header-wrapper">
            <h1 className="product-title">{product.name}</h1>
            <div className="producer-info flex items-center gap-2 text-sm font-bold">
              <span>Por</span>
              <Link
                to={`/@${product.users?.nickname}`}
                className="text-white hover:text-violet-400 flex items-center gap-1.5 transition-colors"
                onMouseEnter={(e) => handleProducerEnter(e, product.users?.nickname, product.users?.is_verified)}
                onMouseLeave={handleProducerLeave}
              >
                {product.users?.nickname}
                {product.users?.is_verified && <BsPatchCheckFill size={14} className="text-violet-500" />}
              </Link>
            </div>
          </div>

          {/* BUYING SECTION */}
          <div className="buying-section-wrapper">
            <div className="section-headline mb-4 flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Seleccionar Licencia</span>
              <button
                className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                onClick={() => setIsComparisonModalOpen(true)}
              >
                <i className="bi bi-layout-sidebar-inset"></i> COMPARAR TABLA
              </button>
            </div>

            <div className="license-grid">
              {product.available_licenses.map(lic => (
                <div
                  key={lic.id}
                  className={clsx("license-card-v2", selectedLicense === lic.id && "selected")}
                  onClick={() => setSelectedLicense(lic.id)}
                >
                  <div className="lic-card-header">
                    <span className="lic-name">{lic.name}</span>
                    {selectedLicense === lic.id && <BiCheck className="text-primary w-5 h-5" />}
                  </div>
                  <div className="lic-card-body">
                    <span className="lic-price-v2">{formatPrice(lic.price)}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lic.price === 0 ? 'Download' : 'License'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full mt-6 py-5 bg-white hover:bg-violet-500 hover:text-white text-black font-black uppercase tracking-[2px] text-sm rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-[0.98] group"
            >
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {product.is_free ? 'DESCARGAR AHORA' : 'AÑADIR AL CARRITO'}
            </button>
          </div>

          {/* TABS SECTION */}
          <div className="product-tabs-container">
            <div className="product-tabs-nav" ref={tabsNavRef}>
              <button className={clsx("tab-btn", activeTab === 'info' && "active")} onClick={() => setActiveTab('info')}>Info</button>
              <button className={clsx("tab-btn", activeTab === 'promos' && "active")} onClick={() => setActiveTab('promos')}>Promos</button>
              <button className={clsx("tab-btn", activeTab === 'negotiate' && "active")} onClick={() => setActiveTab('negotiate')}>Negociar</button>
              <div ref={tabIndicatorRef} className={clsx("tab-indicator", activeTab === null && "opacity-0")}></div>
            </div>

            <div className="product-tab-panes mt-6">
              {activeTab === 'info' && (
                <div className="tab-pane active animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
                    <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Lo que incluye esta licencia:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeLicense.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <BiCheck className="text-primary w-5 h-5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line">{product.description || "Este producto no tiene una descripción adicional."}</p>
                  </div>
                </div>
              )}

              {activeTab === 'promos' && (
                <div className="tab-pane active animate-in fade-in slide-in-from-bottom-2 duration-300 py-4">
                  <div className="promo-card-v2 p-8 border-2 border-dashed border-white/10 rounded-3xl text-center">
                    <Rocket className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h4 className="text-lg font-black uppercase mb-2">¡Oferta de Flash!</h4>
                    <p className="text-gray-400 text-sm mb-6">Usa el código <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">OFFSZN10</span> para un 10% de descuento.</p>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">Copiar Código</button>
                  </div>
                </div>
              )}

              {activeTab === 'negotiate' && (
                <div className="tab-pane active animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-black mb-1">Make an Offer</h3>
                    <p className="text-gray-500 text-sm mb-6">¿Tienes un presupuesto diferente? Envía tu propuesta directamente.</p>

                    <form onSubmit={handleSubmitNegotiation} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="floating-group has-prefix">
                          <span className="prefix">$</span>
                          <input type="number" placeholder=" " required value={negotiateAmount} onChange={(e) => setNegotiateAmount(e.target.value)} />
                          <label>Oferta (USD)</label>
                        </div>
                        <div className="floating-group">
                          <input type="email" placeholder=" " required value={negotiateEmail} onChange={(e) => setNegotiateEmail(e.target.value)} />
                          <label>Tu Email</label>
                        </div>
                      </div>
                      <div className="floating-group">
                        <textarea placeholder=" " rows="3" value={negotiateMessage} onChange={(e) => setNegotiateMessage(e.target.value)}></textarea>
                        <label>Mensaje</label>
                      </div>
                      <button type="submit" disabled={isSubmittingNegotiation} className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                        {isSubmittingNegotiation ? 'ENVIANDO...' : 'ENVIAR OFERTA'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>


      <div className="related-products-section">
        <div className="section-header">
          <h3>Recomendado para ti</h3>
          <div className="nav-arrows">
            <button className="nav-arrow-btn" onClick={() => scrollRelated('left')} title="Anterior"><BiChevronLeft size={24} /></button>
            <button className="nav-arrow-btn" onClick={() => scrollRelated('right')} title="Siguiente"><BiChevronRight size={24} /></button>
          </div>
        </div>
        <div className="trending-grid" ref={trendingGridRef}>
          {relatedProducts?.length > 0 ? (
            relatedProducts.map((related) => (
              <RecommendedCard
                key={related.id}
                item={related}
                onPlay={() => playTrack(related)}
                onProducerHover={handleProducerEnter}
                onProducerLeave={handleProducerLeave}
              />
            ))
          ) : (
            <div className="text-gray-600 text-sm py-10 col-span-full text-center font-bold">Sin recomendaciones todavía</div>
          )}
        </div>
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} product={product} />
      <ExclusivityModal isOpen={isExclusivityModalOpen} onClose={() => setIsExclusivityModalOpen(false)} product={product} />
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        licenses={product.licenses_list || [
          { id: 'basic', name: 'Basic Lease', price: 20, features: ['MP3', '5,000 Streams', '500 Ventas'] },
          { id: 'premium', name: 'Premium Lease', price: 40, features: ['MP3 + WAV', '50,000 Streams', '2,000 Ventas'] },
          { id: 'trackout', name: 'Trackout Lease', price: 60, features: ['MP3 + WAV + TRACKOUT', '500,000 Streams', '10,000 Ventas'] },
          { id: 'unlimited', name: 'Unlimited License', price: 80, features: ['FULL RIGHTS', 'UNLIMITED', 'UNLIMITED'] }
        ]}
        onSelect={(id) => setSelectedLicense(id)}
      />

      {hoveredProducer && (
        <ProducerHoverCard
          nickname={hoveredProducer.nickname}
          isVerified={hoveredProducer.isVerified}
          triggerRect={hoverRect}
          onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
          onMouseLeave={handleProducerLeave}
        />
      )}
    </div>
  );
};

const RecommendedCard = ({ item, onPlay, onProducerHover, onProducerLeave }) => {
  const { url: secureImage } = useSecureUrl(item.image_url);
  const navigate = useNavigate();
  const plays = item.plays_count || 0;

  return (
    <div className="trending-card">
      <div className="t-card-cover">
        <img src={secureImage || '/images/portada-default.png'} alt={item.name} onClick={() => navigate(`/product/${item.slug || item.id}`)} />
        <button className="t-play-btn" onClick={(e) => { e.stopPropagation(); onPlay(); }} title="Reproducir"><BiPlay size={32} /></button>
        <div className="t-overlay-badge" title="Reproducciones" onClick={() => navigate(`/product/${item.slug || item.id}`)}><Music2 size={12} /> {plays}</div>
      </div>
      <div className="t-card-info">
        <h4 title={item.name} onClick={() => navigate(`/product/${item.slug || item.id}`)}>{item.name}</h4>
        <p className="t-card-author" onClick={() => navigate(`/@${item.users?.nickname}`)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => onProducerHover(e, item.users?.nickname, item.users?.is_verified)} onMouseLeave={onProducerLeave}>{item.users?.nickname || 'Unknown'}</p>
      </div>
      <div className="t-meta-row">
        <span style={{ textTransform: 'capitalize' }}>{item.product_type || 'Beat'}</span>
        <span style={{ fontSize: '0.4rem' }}>●</span>
        <span>{item.bpm ? item.bpm + ' BPM' : 'New'}</span>
      </div>
    </div>
  );
};

const InfoRow = ({ label, val, isCapitalized }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/[0.03] text-[0.8rem]">
    <span className="text-[#555] font-bold">{label}</span>
    <span className={`text-[#bbb] font-extrabold ${isCapitalized ? 'capitalize' : ''}`}>{val}</span>
  </div>
);

export default ProductDetail;
