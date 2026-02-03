import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { generateLicensePDF } from '../../utils/licenseGenerator';
import { 
  FaShieldAlt, 
  FaFilePdf, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpotify, 
  FaShoppingCart, 
  FaBroadcastTower, 
  FaMicrophoneAlt,
  FaMusic,
  FaUser
} from 'react-icons/fa';

// Definimos estilos en línea para el degradado dorado y watermark
// para mantener la fidelidad visual sin sobrecargar el CSS global.
const styles = {
  goldText: {
    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900
  },
  watermark: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '15vw',
    fontWeight: 900,
    color: 'transparent',
    WebkitTextStroke: '2px rgba(255, 255, 255, 0.03)',
    pointerEvents: 'none',
    zIndex: 0,
    fontFamily: '"Inter", sans-serif',
    textTransform: 'uppercase'
  }
};

export default function LicenseCertificate() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [securityHash, setSecurityHash] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('ID de orden no proporcionado');
      setLoading(false);
      return;
    }
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      // 1. Fetch Order + Relaciones
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id (name, image_url),
          profiles:producer_id (nickname, full_name, avatar_url)
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) throw new Error('Orden no encontrada');

      // 2. Generar Hash de Seguridad (Simulado)
      // En prod, esto valida la integridad
      const rawString = `${orderId}${data.buyer_email}${data.created_at}OFFSZN_SALT`;
      const hash = await generateSHA256(rawString);
      setSecurityHash(hash);

      // 3. Generar QR URL
      const verifyUrl = `https://offszn.com/verify/${orderId}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}&color=000000`);

      setOrderData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función Helper para SHA256 nativo
  const generateSHA256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleDownload = () => {
    if (!orderData) return;
    
    // Preparar datos para el generador
    const purchaseData = {
      productName: orderData.products?.name || 'Producto Desconocido',
      producerName: orderData.profiles?.nickname || 'OFFSZN Producer',
      amount: orderData.total_amount,
      buyerName: orderData.customer_name || 'Cliente Verificado',
      buyerEmail: orderData.buyer_email,
      purchaseDate: orderData.created_at,
      orderId: orderData.id,
      licenseSettings: orderData.license_settings,
      productType: orderData.product_type || 'beat', // Asumir beat si no existe
      licenseTypeRaw: orderData.license_type || 'basic'
    };

    generateLicensePDF(purchaseData);
  };

  // --- RENDERS ---

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
      <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
      <h2 className="text-white text-2xl font-bold mb-2">Certificado No Encontrado</h2>
      <p className="text-gray-500 mb-6">El ID de orden no existe o es inválido.</p>
      <Link to="/dashboard" className="text-purple-500 hover:text-purple-400 font-semibold">
        Volver al Dashboard
      </Link>
    </div>
  );

  // Parsear Limites para la UI
  const licenseType = (orderData.license_type || 'basic').toLowerCase();
  const isUnlimited = licenseType.includes('unlimited');
  
  // Valores por defecto si no existen en DB
  const limits = {
    streams: isUnlimited ? 'ILIMITADO' : (orderData.license_settings?.streams || '50,000'),
    sales: isUnlimited ? 'ILIMITADO' : (orderData.license_settings?.sales || '5,000'),
    radio: isUnlimited ? 'ILIMITADO' : (orderData.license_settings?.radio || '2 Estaciones')
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] flex justify-center items-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Watermark Background */}
      <div style={styles.watermark}>OFFSZN</div>

      {/* Download Button (Floating) */}
      <button 
        onClick={handleDownload}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(127,0,212,0.4)] transition-all transform hover:-translate-y-1 z-50 flex items-center gap-2"
      >
        <FaFilePdf /> Descargar PDF Oficial
      </button>

      {/* Certificate Container */}
      <div className="w-full max-w-5xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-400 px-4 py-1.5 rounded-full border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-4">
            <FaCheckCircle /> Sello de Autenticidad OFFSZN
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">CERTIFICADO DE LICENCIA</h1>
          <p className="text-gray-500 text-sm font-mono">ID: {orderData.id}</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Validation Hero (QR) */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between text-center hover:border-purple-500/50 transition-colors md:row-span-2">
             <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Verificación</p>
                <div className="text-green-500 font-bold flex items-center justify-center gap-2 text-sm">
                  <FaShieldAlt /> Válido & Activo
                </div>
             </div>
             
             <div className="bg-white p-2 rounded-xl w-40 h-40 mx-auto my-6 flex items-center justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
             </div>

             <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Hash de Seguridad (SHA256)</p>
                <div className="bg-black/50 p-2 rounded border border-white/5 font-mono text-[10px] text-gray-600 break-all leading-tight">
                  {securityHash}
                </div>
             </div>
          </div>

          {/* 2. Transaction Details */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 backdrop-blur-md md:col-span-2 grid grid-cols-2 gap-4">
             <DetailBox label="Order ID" value={`#${orderData.id.slice(0,8).toUpperCase()}`} />
             <DetailBox label="Fecha" value={new Date(orderData.created_at).toLocaleDateString()} />
             <DetailBox label="Monto Total" value={`$${orderData.total_amount} USD`} />
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Licencia</span>
                <span className="text-lg font-bold" style={isUnlimited ? styles.goldText : { color: '#a855f7' }}>
                   {orderData.license_type || 'Standard Lease'} {isUnlimited && '(GOLD)'}
                </span>
             </div>
          </div>

          {/* 3. Parties Involved */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 backdrop-blur-md md:col-span-2">
             <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Partes Involucradas</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Producer */}
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                   <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                      <FaMusic />
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="font-bold text-white truncate">{orderData.profiles?.nickname || 'OFFSZN Official'}</h4>
                      <p className="text-xs text-gray-500">Productor (Licenciante)</p>
                   </div>
                </div>

                {/* Buyer */}
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                   <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                      <FaUser />
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="font-bold text-white truncate">{orderData.customer_name || orderData.buyer_email}</h4>
                      <p className="text-xs text-gray-500">Artista (Licenciatario)</p>
                   </div>
                </div>

             </div>
          </div>

          {/* 4. Visual Terms (Rights) */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 backdrop-blur-md md:col-span-3">
             <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 text-center">Derechos Otorgados</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TermBox icon={<FaSpotify />} value={limits.streams} label="Streams" isUnlimited={isUnlimited} />
                <TermBox icon={<FaShoppingCart />} value={limits.sales} label="Ventas" isUnlimited={isUnlimited} />
                <TermBox icon={<FaBroadcastTower />} value={limits.radio} label="Radio" isUnlimited={isUnlimited} />
                <TermBox icon={<FaMicrophoneAlt />} value="Permitido" label="En Vivo" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES PARA LIMPIEZA ---

function DetailBox({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function TermBox({ icon, value, label, isUnlimited }) {
  const isValueUnlimited = value.toString().toUpperCase() === 'ILIMITADO' || value.toString().toUpperCase() === 'UNLIMITED';
  
  return (
    <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors group">
      <div className="text-purple-500 text-xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <div 
        className="font-bold text-lg mb-1"
        style={(isUnlimited || isValueUnlimited) ? styles.goldText : { color: 'white' }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 font-bold uppercase">{label}</div>
    </div>
  );
}