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
import { Music2, ShoppingCart } from 'lucide-react';
import { BiPlay, BiPause, BiHeart, BiShareAlt, BiCheck, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsPatchCheckFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
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
      <div className="product-split-layout">

        {/* --- LEFT COL: SIDEBAR --- */}
        <aside className="product-sidebar">
          <div className="product-cover-art" style={{ position: 'relative' }}>
            <img
              src={product.image_url || '/images/portada-default.png'}
              alt={product.name}
              id="product-main-art"
            />
            <div className="product-cover-play-btn" onClick={handlePlay}>
              {isCurrent && isPlaying ? <BiPause /> : <BiPlay />}
            </div>
            <div className="product-cover-badge desktop-only-flex">
              <Music2 size={14} /> {product.plays_count || 0}
            </div>
          </div>

          <div className="social-actions-wrapper">
            <button
              onClick={handleLike}
              className={`action-btn-icon ${isLiked ? 'liked' : ''}`}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span className="stat-value">{product.likes_count || 0}</span>
            </button>
            <button
              onClick={handleShare}
              className="action-btn-icon"
            >
              <i className="bi bi-share"></i>
              <span className="stat-value">SHARE</span>
            </button>
            <button
              className="action-btn-icon"
              id="btn-exclusivity"
              onClick={() => setIsExclusivityModalOpen(true)}
            >
              <i className="bi bi-plus-lg"></i>
              <span className="stat-value">EXCLUSIVA</span>
            </button>
          </div>

          <div className="info-list-container">
            <div className="info-list" id="content-info">
              <div className="info-title-desktop" style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase' }}>Información</div>
              <InfoRow label="Publicado" val={new Date(product.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <InfoRow label="Categoría" val={product.product_type === 'beat' ? 'Beat' : product.product_type} isCapitalized />
              {product.product_type === 'beat' && (
                <>
                  <InfoRow label="BPM" val={product.bpm || '--'} />
                  <InfoRow label="Key" val={`${product.key || '--'} ${product.key_scale || ''}`} />
                </>
              )}
              <InfoRow label="Visualizaciones" val={product.plays_count || 0} />
            </div>
          </div>

          <div className="tags-section" style={{ marginTop: '20px' }}>
            <div className="tags-row" id="tags-container">
              {product.tags && (Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, i) => (
                <Link key={i} to={`/explorar?tag=${tag.trim()}`} className="tag-pill">
                  #{tag.trim()}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* --- RIGHT COL: MAIN CONTENT --- */}
        <main className="product-main-content">
          <div className="product-header-wrapper">
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

          <div className="buying-section-wrapper" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            <div className="section-headline" id="licenses-header">
              <span>Licencias</span>
              {product.product_type === 'beat' && (
                <span
                  className="desktop-only-flex"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsComparisonModalOpen(true)}
                >
                  <i className="bi bi-layout-sidebar-inset"></i> Comparar
                </span>
              )}
            </div>

            <div id="buying-modules">
              <div className="license-grid">
                {product.available_licenses.map(lic => (
                  <div
                    key={lic.id}
                    className={`license-card-v2 ${selectedLicense === lic.id ? 'selected' : ''}`}
                    onClick={() => setSelectedLicense(lic.id)}
                  >
                    <div className="lic-card-header">
                      <span className="lic-name">{lic.name}</span>
                      <i className="bi bi-info-circle lic-details-trigger"></i>
                    </div>
                    <div className="lic-card-body" style={{ marginTop: '5px' }}>
                      <span className="lic-files-preview">MP3, WAV</span>
                      <span className="lic-price-v2">{formatPrice(lic.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full mt-5 py-5 bg-white hover:bg-[#eee] text-black font-extrabold uppercase tracking-[2px] text-sm rounded-xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-[0.985]"
            >
              <ShoppingCart size={20} />
              {window.innerWidth > 768 ? 'AÑADIR AL CARRITO' : 'COMPRAR'}
            </button>
          </div>

          <div className="product-tabs-container">
            <div className="product-tabs-nav" ref={tabsNavRef}>
              <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Información</button>
              <button className={`tab-btn ${activeTab === 'promos' ? 'active' : ''}`} onClick={() => setActiveTab('promos')}>Promociones</button>
              <button className={`tab-btn ${activeTab === 'negotiate' ? 'active' : ''}`} onClick={() => setActiveTab('negotiate')}>Negociar</button>
              <div ref={tabIndicatorRef} className="tab-indicator"></div>
            </div>

            <div className="product-tab-panes">
              {activeTab === 'info' && (
                <div className="tab-pane active">
                  <div id="dynamic-lic-terms" style={{ marginTop: '0', borderTop: 'none', paddingBottom: '20px' }}>
                    <div className="terms-content-v2" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[0.85rem] font-extrabold text-white uppercase">{activeLicense.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.82rem] text-gray-400 font-bold">
                        <div className="flex items-center gap-2"><i className="bi bi-check-circle-fill text-violet-500"></i>{activeLicense.features?.[0] || 'MP3 + WAV'}</div>
                        <div className="flex items-center gap-2"><i className="bi bi-check-circle-fill text-violet-500"></i>Streams: {activeLicense.features?.[1]?.replace(' Streams', '') || '50,000'}</div>
                        <div className="flex items-center gap-2"><i className="bi bi-check-circle-fill text-violet-500"></i>Ventas: {activeLicense.features?.[2]?.replace(' Ventas', '') || '2,000'}</div>
                        <div className="flex items-center gap-2"><i className="bi bi-check-circle-fill text-violet-500"></i>PDF Oficial</div>
                      </div>
                    </div>
                  </div>
                  <div className="about-section mt-2">
                    <div className="text-[#888] text-[0.95rem] leading-relaxed whitespace-pre-line">{product.description || "Sin descripción disponible."}</div>
                  </div>
                </div>
              )}

              {activeTab === 'promos' && (
                <div className="tab-pane active">
                  <div className="promos-container py-5">
                    <div className="promo-card-v2">
                      <div className="text-[0.85rem] font-extrabold text-white tracking-[2px] mb-3 uppercase">Oferta de Bienvenida</div>
                      <div className="text-[#888] text-base mb-6 leading-normal">Obtén un <b className="text-white">10% OFF</b> inmediato en tu primera compra al unirte a la plataforma.</div>
                      <button className="w-full max-w-[280px] bg-white text-black font-bold py-3 rounded-lg mx-auto block text-sm">OBTENER MI DESCUENTO</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'negotiate' && (
                <div className="tab-pane active">
                  <div className="negotiate-pane-content py-5">
                    <div className="font-extrabold text-white text-xl mb-1">¿Tienes un presupuesto diferente?</div>
                    <div className="text-[#888] text-base mb-6 leading-tight">Envía tu oferta directamente al productor y recibe una respuesta en menos de 24h.</div>

                    <form onSubmit={handleSubmitNegotiation} className="negotiate-form-inline">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="floating-group has-prefix flex-1">
                            <span className="prefix">$</span>
                            <input
                              type="number"
                              id="offer-amount-inline"
                              placeholder=" "
                              required
                              value={negotiateAmount}
                              onChange={(e) => setNegotiateAmount(e.target.value)}
                            />
                            <label htmlFor="offer-amount-inline">TU OFERTA (USD)</label>
                          </div>
                          <div className="floating-group flex-1">
                            <input
                              type="email"
                              id="offer-email-inline"
                              placeholder=" "
                              required
                              value={negotiateEmail}
                              onChange={(e) => setNegotiateEmail(e.target.value)}
                            />
                            <label htmlFor="offer-email-inline">TU EMAIL</label>
                          </div>
                        </div>

                        <div className="floating-group">
                          <textarea
                            id="offer-message-inline"
                            placeholder=" "
                            rows="3"
                            value={negotiateMessage}
                            onChange={(e) => setNegotiateMessage(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 pt-6 text-white text-sm outline-none focus:border-violet-500 transition-all resize-none"
                          ></textarea>
                          <label htmlFor="offer-message-inline" style={{ top: '24px' }}>MENSAJE (OPCIONAL)</label>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingNegotiation}
                          className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 text-black font-black py-4 rounded-xl mt-2 transition-all shadow-lg active:scale-[0.985]"
                        >
                          {isSubmittingNegotiation ? 'ENVIANDO...' : 'ENVIAR PROPUESTA'}
                        </button>
                      </div>
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
        <button className="t-play-btn" onClick={(e) => { e.stopPropagation(); onPlay(); }} title="Reproducir"><i className="bi bi-play-fill"></i></button>
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
