import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/client';
import { Link } from 'react-router-dom';
import { jsPDF } from "jspdf";
import {
  ShoppingBag,
  Search,
  Download,
  FileText,
  Music,
  Archive,
  Package,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Disc,
  Printer,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function Purchases() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            transaction_id,
            status,
            total_price,
            created_at,
            order_items (
                id,
                price_at_purchase,
                license_name,
                products (
                    id,
                    name,
                    image_url,
                    product_type,
                    mp3_url,
                    wav_url,
                    stems_url,
                    users ( nickname )
                )
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['approved', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const flatList = [];
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          if (item.products) {
            flatList.push({
              purchase_id: item.id,
              order_id: order.id,
              transaction_id: order.transaction_id,
              date: order.created_at,
              price: item.price_at_purchase,
              license_type: item.license_name || 'Basic',
              product: item.products,
              producer_name: item.products.users?.nickname || 'Productor'
            });
          }
        });
      });

      setPurchases(flatList);
    } catch (error) {
      console.error("Error cargando compras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileType, product, orderId) => {
    if (downloading) return;
    setDownloading(true);

    try {
      let url = '';
      if (fileType === 'mp3') url = product.mp3_url;
      else if (fileType === 'wav') url = product.wav_url;
      else if (fileType === 'stems') url = product.stems_url;

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${product.name}.${fileType}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Archivo no disponible actualmente.");
      }

    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const generatePDF = (purchase) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("LICENCIA DE USO", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`ID Transacción: ${purchase.transaction_id || 'N/A'}`, 20, 40);
    doc.text(`Fecha: ${new Date(purchase.date).toLocaleDateString()}`, 20, 50);
    doc.setFontSize(16);
    doc.text(`Producto: ${purchase.product.name}`, 20, 70);
    doc.text(`Productor: ${purchase.producer_name}`, 20, 80);
    doc.text(`Tipo de Licencia: ${purchase.license_type.toUpperCase()}`, 20, 90);
    doc.setFontSize(10);
    doc.text("Este documento certifica que el usuario posee los derechos de uso", 20, 110);
    doc.text("estipulados en los términos y condiciones de OFFSZN para este archivo.", 20, 115);
    doc.text("Generado automáticamente por OFFSZN", 105, 280, null, null, "center");
    doc.save(`Licencia_${purchase.product.name}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-violet-500" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Sincronizando biblioteca personal...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
              <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Vault</span>
            </div>
            <div className="h-px w-8 bg-white/5"></div>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
            Mi <span className="text-violet-500">Colección</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
            <ShieldCheck size={12} className="text-violet-500" /> Tienes acceso a {purchases.length} licencias de uso profesional
          </p>
        </div>

        <div className="flex items-center gap-3 p-1.5 bg-[#0A0A0A] border border-white/5 rounded-full px-6 py-3">
          <ShoppingBag size={14} className="text-gray-700" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Compras: {purchases.length}</span>
        </div>
      </div>

      {purchases.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 mb-20">
          {purchases.map((item) => (
            <PurchaseCard
              key={`${item.order_id}-${item.purchase_id}`}
              item={item}
              onDownload={handleDownload}
              onGeneratePDF={generatePDF}
              isDownloading={downloading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTE: CARD DE COMPRA ---
function PurchaseCard({ item, onDownload, onGeneratePDF, isDownloading }) {
  const { product } = item;

  return (
    <div className="group bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden flex flex-col lg:flex-row lg:items-center gap-10">

      {/* Background Accent */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-600/5 blur-[100px] pointer-events-none group-hover:bg-violet-600/10 transition-all duration-700"></div>

      {/* Artwork Section */}
      <div className="relative flex-shrink-0 mx-auto lg:mx-0">
        <div className="w-32 h-32 lg:w-40 lg:h-40 relative">
          <img
            src={product.image_url || 'https://via.placeholder.com/150'}
            alt={product.name}
            className="w-full h-full rounded-[32px] object-cover bg-black border border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 rounded-[32px] backdrop-blur-sm">
            <Disc size={40} className="text-white animate-spin-slow opacity-50" />
          </div>

          {/* Badge de Tipo */}
          <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-2xl transform group-hover:scale-110 transition-transform">
            {product.product_type}
          </div>
        </div>
      </div>

      {/* Info Core */}
      <div className="flex-1 min-w-0 flex flex-col justify-center text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-3">
          <div className="px-4 py-1 bg-violet-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
            {item.license_type}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest italic">
            <Clock size={12} /> {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white mb-2 group-hover:text-violet-400 transition-colors leading-none">
          {product.name}
        </h3>

        <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Music size={10} className="text-violet-500" />
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            By <span className="text-white group-hover:text-violet-400 transition-colors">{item.producer_name}</span>
          </p>
        </div>
      </div>

      {/* Transaction Details (Hidden on small mobile) */}
      <div className="hidden xl:flex flex-col items-end gap-2 px-10 border-x border-white/5 shrink-0">
        <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Signature ID</span>
        <div className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-help group/id" title={item.transaction_id}>
          <span className="text-[10px] font-mono tracking-tighter opacity-40 group-hover/id:opacity-100 transition-opacity">
            {item.transaction_id ? `${item.transaction_id.substring(0, 16)}...` : 'N/A'}
          </span>
          <ExternalLink size={10} className="opacity-20 group-hover/id:opacity-100" />
        </div>
      </div>

      {/* Actions Hub */}
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0 lg:w-80">

        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar justify-center">
          {product.mp3_url && (
            <DownloadBtn
              onClick={() => onDownload('mp3', product, item.order_id)}
              disabled={isDownloading}
              label="MP3"
              accent="violet"
            />
          )}

          {product.wav_url && (
            <DownloadBtn
              onClick={() => onDownload('wav', product, item.order_id)}
              disabled={isDownloading}
              label="WAV"
              accent="emerald"
            />
          )}

          {(product.stems_url || product.product_type === 'drumkit') && (
            <DownloadBtn
              onClick={() => onDownload('stems', product, item.order_id)}
              disabled={isDownloading}
              label="STEMS"
              accent="amber"
            />
          )}
        </div>

        <button
          onClick={() => onGeneratePDF(item)}
          className="group/pdf flex items-center justify-center gap-3 w-full lg:w-auto h-14 px-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          <FileText size={18} className="group-hover/pdf:rotate-6 transition-transform" />
          Licencia Oficial
        </button>
      </div>
    </div>
  );
}

function DownloadBtn({ onClick, disabled, label, accent }) {
  const colors = {
    violet: 'hover:bg-violet-500 hover:border-violet-400/50',
    emerald: 'hover:bg-emerald-500 hover:border-emerald-400/50',
    amber: 'hover:bg-amber-500 hover:border-amber-400/50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-14 w-14 lg:w-20 flex items-center justify-center bg-white/5 border border-white/5 rounded-[22px] transition-all active:scale-90 disabled:opacity-50 group/btn ${colors[accent]}`}
    >
      <div className="flex flex-col items-center">
        <Download size={18} className="text-white group-hover/btn:translate-y-0.5 transition-transform" />
        <span className="text-[8px] font-black uppercase mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">{label}</span>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="p-24 flex flex-col items-center justify-center text-center bg-[#070707] border border-white/5 rounded-[60px] relative overflow-hidden group mb-20">
      <div className="absolute top-0 right-0 p-32 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
        <ShoppingBag size={400} />
      </div>

      <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 mb-10 group-hover:scale-110 transition-transform duration-700">
        <ShoppingBag className="text-gray-800" size={64} />
      </div>

      <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Tu Bóveda está Vacía</h3>
      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-12 max-w-sm leading-relaxed">
        Comienza a construir tu sonido profesional adquiriendo las licencias de los mejores productores.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 w-full max-w-3xl">
        <LinkCard type="beat" to="/explorar?type=beat" />
        <LinkCard type="drumkit" to="/explorar?type=drumkit" />
        <LinkCard type="loopkit" to="/explorar?type=loopkit" />
      </div>

      <Link to="/explorar" className="group flex items-center gap-3 px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95">
        Marketplace Explorer
        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Link>
    </div>
  );
}

function LinkCard({ type, to }) {
  const icons = {
    beat: Music,
    drumkit: Package,
    loopkit: Archive
  };
  const labels = {
    beat: 'PRO BEATS',
    drumkit: 'DRUM KITS',
    loopkit: 'BUNDLE PACKS'
  };
  const Icon = icons[type];

  return (
    <Link to={to} className="p-10 bg-black/40 border border-white/5 rounded-[40px] hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center group/box">
      <Icon className="text-gray-800 mb-6 mx-auto group-hover/box:text-violet-500 group-hover/box:scale-110 transition-all duration-500" size={40} />
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover/box:text-white transition-colors">{labels[type]}</h4>
    </Link>
  );
}

function ActionBtn({ onClick, disabled, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 h-10 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
    >
      <Icon size={14} className="text-violet-500" /> {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="p-20 flex flex-col items-center justify-center text-center bg-[#0A0A0A] border border-white/5 rounded-[40px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform">
        <ShoppingBag size={200} />
      </div>

      <div className="p-6 rounded-full bg-white/5 mb-8">
        <ShoppingBag className="text-gray-700" size={48} />
      </div>

      <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Aún no tienes compras</h3>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-10 max-w-sm">
        Explora los mejores beats, drum kits y presets creados por la comunidad.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-2xl">
        <LinkBox type="beat" to="/explorar?type=beat" />
        <LinkBox type="drumkit" to="/explorar?type=drumkit" />
        <LinkBox type="loopkit" to="/explorar?type=loopkit" />
      </div>

      <Link to="/explorar" className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95">
        Explorar Marketplace
      </Link>
    </div>
  );
}

// Re-usando Link pero para las cajas de categorias en EmptyState
const LinkBox = ({ type, to }) => {
  const icons = {
    beat: Music,
    drumkit: Package,
    loopkit: Archive
  };
  const labels = {
    beat: 'BEATS',
    drumkit: 'DRUM KITS',
    loopkit: 'LOOPS'
  };
  const Icon = icons[type];

  return (
    <Link to={to} className="p-8 bg-black/40 border border-white/5 rounded-3xl hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center group/box">
      <Icon className="text-gray-700 mb-4 mx-auto group-hover/box:text-violet-500 transition-colors" size={32} />
      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/box:text-white transition-colors">{labels[type]}</h4>
    </Link>
  );
};
