import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mocks/products';
import { usePlayerStore } from '../store/playerStore';
import { useCartStore } from '../store/cartStore';
import '../styles/product-premium.css'; // Importamos tus estilos

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState('basic');
  const [activeAccordion, setActiveAccordion] = useState(['desc', 'terms']); // Abiertos por defecto
  const addToCart = useCartStore(state => state.addToCart);
  
  // Store del Reproductor
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    // 1. Simulación de Fetch (Aquí iría tu código de Supabase de product-core.js)
    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) {
      setProduct({
        ...found,
        // Simulamos licencias disponibles basado en tu lógica
        available_licenses: [
          { id: 'basic', name: 'Basic Lease', price: found.price_basic, features: ['MP3', '5,000 Streams'] },
          { id: 'premium', name: 'Premium Lease', price: found.price_basic + 20, features: ['MP3', 'WAV', '50,000 Streams'] },
          { id: 'unlimited', name: 'Unlimited', price: found.price_basic + 80, features: ['MP3', 'WAV', 'STEMS', 'Ilimitado'] }
        ]
      });
    } else {
      navigate('/explorar');
    }
    // Scroll al inicio al cargar
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (!product) return <div className="loading-state"><div className="spinner"></div></div>;

  const isCurrent = currentTrack?.id === product.id;

  // --- HANDLERS ---
  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(product);
    }
  };

  const toggleAccordion = (section) => {
    if (activeAccordion.includes(section)) {
      setActiveAccordion(activeAccordion.filter(s => s !== section));
    } else {
      setActiveAccordion([...activeAccordion, section]);
    }
  };

  const handleAddToCart = () => {
    alert(`Añadido al carrito:\n${product.name}\nLicencia: ${selectedLicense}`);
    // Aquí conectaremos tu script/cart.js o el Store de carrito más adelante
    addToCart(product, selectedLicense);
  };

  // --- RENDERIZADO DE MÓDULOS DE COMPRA (Simulando renderBeatSpecifics/renderKitSpecifics) ---
  const renderBuyingModule = () => {
    // Si es un KIT (Sample Pack / Preset)
    if (product.category === 'Drum Kits' || product.category === 'Loops' || product.category === 'Presets') {
      return (
        <div id="buying-modules">
          <button 
            className="btn-purchase-kit"
            onClick={handleAddToCart}
          >
            {product.is_free ? 'DESCARGA GRATIS' : `COMPRAR KIT - $${product.price_basic}`}
          </button>
          
          {product.product_type !== 'drumkit' && (
             // Botón secundario para demos si aplica
             <button className="btn-minimal-link" style={{margin: '10px auto', width:'100%', justifyContent:'center'}}>
               <i className="bi bi-arrow-down-circle"></i> Descargar Demo / Gratis
             </button>
          )}
        </div>
      );
    }

    // Si es un BEAT (Default)
    return (
      <div id="buying-modules">
        {/* Header con botón comparar */}
        <div className="section-headline" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>Licencias</span>
            <button className="btn-minimal-link" style={{fontSize:'0.9rem'}}>
                <i className="bi bi-layout-three-columns"></i> Comparar
            </button>
        </div>

        {/* Grid de Licencias (V2) */}
        <div className="license-grid-v2">
          {product.available_licenses.map((lic) => (
            <div 
              key={lic.id}
              className={`license-card-v2 ${selectedLicense === lic.id ? 'selected' : ''}`}
              onClick={() => setSelectedLicense(lic.id)}
            >
              <div className="lic-card-header">
                <span className="lic-name">{lic.name}</span>
                <i className="bi bi-info-circle lic-details-trigger"></i>
              </div>
              <div className="lic-card-body">
                <span className="lic-files-preview">{lic.features.join(' + ')}</span>
                <span className="lic-price-v2">${lic.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="beat-actions-footer" style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
            <button className="btn-glass-primary" onClick={handleAddToCart}>
                <i className="bi bi-cart-plus"></i> Añadir al Carrito
            </button>
            {product.is_free && (
                <button className="btn-minimal-link" style={{justifyContent:'center', width:'100%'}}>
                    <i className="bi bi-download"></i> Descargar Gratis (MP3 con Tag)
                </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div id="product-page-container">
      <div className="product-split-layout">
        
        {/* --- LEFT: SIDEBAR --- */}
        <div className="product-sidebar">
          {/* Cover Art & Play Overlay */}
          <div className="product-cover-art group">
            <img src={product.image_url} alt={product.name} />
            
            {/* Player Target (Simulado visualmente para coincidir con tu CSS) */}
            <div style={{position:'absolute', bottom:'15px', left:'15px', right:'15px'}}>
               <div className="product-hero-player-box" style={{background: 'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <button onClick={handlePlay} style={{background:'none', border:'none', color:'#fff', fontSize:'1.5rem', cursor:'pointer'}}>
                          {isCurrent && isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}
                      </button>
                      <div style={{flex:1, height:'30px', background:'rgba(255,255,255,0.1)', borderRadius:'4px'}}>
                         {/* Aquí iría la waveform pequeña */}
                      </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Social Actions */}
          <div className="action-row" style={{justifyContent:'center', marginTop:'20px'}}>
             <button className="action-btn-icon">
                <i className="bi bi-heart"></i>
                <span className="stat-value">{product.plays_count}</span>
             </button>
             <button className="action-btn-icon">
                <i className="bi bi-upload"></i>
                <span className="stat-value">&nbsp;</span>
             </button>
             <button className="action-btn-icon">
                <i className="bi bi-plus-lg"></i>
                <span className="stat-value">&nbsp;</span>
             </button>
          </div>

          {/* Info List */}
          <div className="info-list">
             <div style={{fontSize:'0.8rem', color:'#666', marginBottom:'5px', fontWeight:700, textTransform:'uppercase'}}>Información</div>
             <div className="info-row"><span className="info-label">Publicado</span> <span className="info-val">Hoy</span></div>
             <div className="info-row"><span className="info-label">BPM</span> <span className="info-val">150</span></div>
             <div className="info-row"><span className="info-label">Key</span> <span className="info-val">Cm</span></div>
             <div className="info-row"><span className="info-label">Plays</span> <span className="info-val">{product.plays_count}</span></div>
          </div>

          {/* Tags */}
          <div className="tags-section" style={{marginTop:'20px'}}>
             <div className="tags-row">
                <span className="tag-pill">#Dark</span>
                <span className="tag-pill">#Trap</span>
                <span className="tag-pill">#Tainy</span>
             </div>
          </div>
        </div>

        {/* --- RIGHT: MAIN CONTENT --- */}
        <div className="product-main-content">
           
           {/* Header */}
           <div>
              <h1 style={{fontSize:'3rem', fontWeight:800, lineHeight:1.1, marginBottom:'10px'}}>{product.name}</h1>
              <span style={{color:'#aaa', fontSize:'1rem', marginBottom:'20px', display:'inline-flex', alignItems:'center', cursor:'pointer'}}>
                 {product.producer_name} <i className="bi bi-patch-check-fill" style={{color:'#A020F0', marginLeft:'4px'}}></i>
              </span>
           </div>

           {/* Logic Switcher: Beats vs Kits */}
           {renderBuyingModule()}

           {/* Description Accordion */}
           <div className="section-headline" onClick={() => toggleAccordion('desc')} style={{cursor:'pointer', marginTop:'25px'}}>
              <span>Descripción</span>
              <i className={`bi bi-chevron-down chevron-icon ${activeAccordion.includes('desc') ? 'rotate' : ''}`} style={{color:'#666'}}></i>
           </div>
           <div className={`terms-accordion-content ${activeAccordion.includes('desc') ? 'open' : ''}`} style={{color:'#888', fontSize:'1rem', lineHeight:1.6, whiteSpace:'pre-line'}}>
              Este pack contiene los sonidos más duros del género. Inspirado en artistas top.
              <br/>Incluye todo lo necesario para tu próximo hit.
           </div>

           {/* Terms Accordion */}
           <div className="section-headline" onClick={() => toggleAccordion('terms')} style={{cursor:'pointer', marginTop:'15px'}}>
              <span>Términos de Uso</span>
              <i className={`bi bi-chevron-down chevron-icon ${activeAccordion.includes('terms') ? 'rotate' : ''}`} style={{color:'#666'}}></i>
           </div>
           <div className={`terms-accordion-content ${activeAccordion.includes('terms') ? 'open' : ''}`} style={{color:'#888', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'40px'}}>
              <p>Este producto está sujeto a licencias de uso. Lee los términos completos antes de distribuir tu obra.</p>
           </div>

        </div>

      </div>

      {/* --- RELATED PRODUCTS SECTION --- */}
      <div className="related-products-section">
         <div className="section-header" style={{marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{color:'#fff', fontSize:'1.5rem', fontWeight:800}}>Recomendado para ti</h3>
            <div className="nav-arrows" style={{display:'flex', gap:'10px'}}>
               <button className="nav-arrow-btn"><i className="bi bi-chevron-left"></i></button>
               <button className="nav-arrow-btn"><i className="bi bi-chevron-right"></i></button>
            </div>
         </div>
         {/* Grid simulado, aquí mapearíamos más productos */}
         <div className="trending-grid">
            {MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 5).map(rel => (
               <div key={rel.id} className="trending-card" onClick={() => navigate(`/producto/${rel.id}`)}>
                   <div className="t-card-cover">
                      <img src={rel.image_url} alt={rel.name} />
                   </div>
                   <div className="t-card-info">
                      <h4>{rel.name}</h4>
                      <p>{rel.producer_name}</p>
                   </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default ProductDetail;