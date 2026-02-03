import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { Link } from 'react-router-dom';
import { jsPDF } from "jspdf";
import { 
  BiShoppingBag, 
  BiSearch, 
  BiDownload, 
  BiFile, 
  BiMusic, 
  BiArchive, 
  BiBox, 
  BiErrorCircle 
} from 'react-icons/bi';

export default function Purchases() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [downloading, setDownloading] = useState(false); // Estado para cooldown visual
  
  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // AuthGuard debería manejar esto, pero por seguridad

      // Consulta compleja para obtener pedidos y sus productos anidados
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

      // Aplanar la estructura: De Pedidos -> Lista plana de Items comprados
      const flatList = [];
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
           if(item.products) {
             flatList.push({
               purchase_id: item.id, // ID único del item comprado
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

  // --- LÓGICA DE DESCARGA SEGURA ---
  const handleDownload = async (fileType, product, orderId) => {
    if (downloading) return;
    setDownloading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sesión expirada"); 
        return;
      }

      // Llamada a tu Endpoint (Edge Function o Backend propio)
      // Como estamos en React puro por ahora, simularemos la redirección 
      // si tienes las URLs públicas en la tabla products (CUIDADO: idealmente usar presigned URLs).
      
      // *LÓGICA SEGURA IDEAL*:
      /*
      const res = await fetch(`/api/orders/download-link?orderId=${orderId}&productId=${product.id}&fileType=${fileType}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const { signedUrl } = await res.json();
      window.location.href = signedUrl;
      */

      // *LÓGICA TEMPORAL (Directa de columnas)*:
      let url = '';
      if (fileType === 'mp3') url = product.mp3_url;
      else if (fileType === 'wav') url = product.wav_url;
      else if (fileType === 'stems') url = product.stems_url;
      
      if(url) {
        // Crear enlace temporal
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${product.name}.${fileType}`); // Sugerir nombre
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Archivo no disponible actualmente.");
      }

    } catch (error) {
      console.error("Download error:", error);
      alert("Error en la descarga.");
    } finally {
      // Cooldown de 2 segundos
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  // --- GENERACIÓN DE LICENCIA PDF ---
  const generatePDF = (purchase) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("LICENCIA DE USO", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`ID Transacción: ${purchase.transaction_id || 'N/A'}`, 20, 40);
    doc.text(`Fecha: ${new Date(purchase.date).toLocaleDateString()}`, 20, 50);
    
    // Contenido
    doc.setFontSize(16);
    doc.text(`Producto: ${purchase.product.name}`, 20, 70);
    doc.text(`Productor: ${purchase.producer_name}`, 20, 80);
    doc.text(`Tipo de Licencia: ${purchase.license_type.toUpperCase()}`, 20, 90);
    
    doc.setFontSize(10);
    doc.text("Este documento certifica que el usuario posee los derechos de uso", 20, 110);
    doc.text("estipulados en los términos y condiciones de OFFSZN para este archivo.", 20, 115);

    // Footer
    doc.text("Generado automáticamente por OFFSZN", 105, 280, null, null, "center");
    
    doc.save(`Licencia_${purchase.product.name}.pdf`);
  };

  return (
    <div className="w-full min-h-screen relative pb-20">
      <div className="fixed top-0 left-0 w-full h-full bg-[#050505] -z-10"></div>

      {/* HEADER */}
      <div className="mb-10 mt-6">
        <h1 className="text-4xl font-extrabold text-white mb-2 font-['Plus_Jakarta_Sans']">Mis Compras</h1>
        <p className="text-[#888] text-lg">Gestiona tus archivos, licencias y recibos.</p>
      </div>

      {/* CONTENT BOX */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-[80px_2.5fr_100px_120px_140px_1.5fr] gap-6 p-6 border-b border-[rgba(255,255,255,0.08)] bg-black/30 text-[#555] text-xs font-extrabold uppercase tracking-widest">
            <div>Portada</div>
            <div>Producto</div>
            <div>Monto</div>
            <div>Fecha</div>
            <div>Transacción</div>
            <div className="text-right">Descargas</div>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {loading ? (
             <div className="p-10 text-center text-[#666]">Cargando tus compras...</div>
          ) : purchases.length === 0 ? (
             <EmptyState />
          ) : (
             purchases.map((item) => (
                <PurchaseRow 
                  key={`${item.order_id}-${item.purchase_id}`} 
                  item={item} 
                  onDownload={handleDownload}
                  onGeneratePDF={generatePDF}
                  isDownloading={downloading}
                />
             ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE: FILA DE COMPRA ---
function PurchaseRow({ item, onDownload, onGeneratePDF, isDownloading }) {
  const { product } = item;
  
  return (
    <div className="group grid grid-cols-1 md:grid-cols-[80px_2.5fr_100px_120px_140px_1.5fr] gap-4 md:gap-6 items-center p-6 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between mb-2">
            <span className="text-[#666] text-xs uppercase font-bold">Fecha: {new Date(item.date).toLocaleDateString()}</span>
            <span className="text-[#444] text-xs font-mono">{item.transaction_id?.substring(0,8)}...</span>
        </div>

        {/* Cover */}
        <img 
          src={product.image_url || 'https://via.placeholder.com/150'} 
          alt={product.name} 
          className="w-[72px] h-[72px] rounded-xl object-cover bg-[#111] shadow-lg border border-[rgba(255,255,255,0.05)]"
        />

        {/* Info */}
        <div className="min-w-0">
            <h3 className="text-white font-bold text-lg truncate mb-1">{product.name}</h3>
            <p className="text-[#777] text-sm font-medium">{item.producer_name}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-[#555] border border-[#333] px-1.5 py-0.5 rounded uppercase">
              {item.license_type}
            </span>
        </div>

        {/* Price */}
        <div className="text-white font-bold text-lg">
           {item.price === 0 ? (
             <span className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">FREE</span>
           ) : (
             `$${item.price}`
           )}
        </div>

        {/* Date (Desktop) */}
        <div className="hidden md:block text-[#999] text-sm font-medium">
            {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>

        {/* ID (Desktop) */}
        <div className="hidden md:block text-[#444] text-xs font-mono truncate" title={item.transaction_id}>
            {item.transaction_id}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            
            {/* MP3 */}
            {product.mp3_url && (
              <button 
                onClick={() => onDownload('mp3', product, item.order_id)}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#eee] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50"
              >
                <BiMusic /> MP3
              </button>
            )}

            {/* WAV */}
            {product.wav_url && (
              <button 
                onClick={() => onDownload('wav', product, item.order_id)}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#eee] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50"
              >
                <BiMusic /> WAV
              </button>
            )}

            {/* ZIP/STEMS */}
            {(product.stems_url || product.product_type === 'drumkit') && (
              <button 
                onClick={() => onDownload('stems', product, item.order_id)}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#eee] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50"
              >
                 {product.product_type === 'drumkit' ? <BiBox /> : <BiArchive />} ZIP
              </button>
            )}

            {/* LICENCIA PDF */}
            <button 
              onClick={() => onGeneratePDF(item)}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 border border-transparent px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
            >
               <BiFile /> PDF
            </button>
        </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
       <div className="text-5xl text-[#222] mb-6"><BiShoppingBag /></div>
       <h3 className="text-white text-xl font-bold mb-2">Aún no tienes compras</h3>
       <p className="text-[#666] text-sm mb-8 max-w-md">Explora los mejores beats, drum kits y presets creados por la comunidad de OFFSZN.</p>
       
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-2xl">
          <Link to="/explorar?type=beat" className="bg-[#111] p-6 rounded-xl border border-[#222] hover:border-[#444] transition-colors group">
             <BiMusic className="text-2xl text-[#666] group-hover:text-purple-500 mb-3 mx-auto transition-colors" />
             <h4 className="text-white font-bold text-sm">Beats</h4>
          </Link>
          <Link to="/explorar?type=drumkit" className="bg-[#111] p-6 rounded-xl border border-[#222] hover:border-[#444] transition-colors group">
             <BiBox className="text-2xl text-[#666] group-hover:text-purple-500 mb-3 mx-auto transition-colors" />
             <h4 className="text-white font-bold text-sm">Drum Kits</h4>
          </Link>
          <Link to="/explorar?type=loopkit" className="bg-[#111] p-6 rounded-xl border border-[#222] hover:border-[#444] transition-colors group">
             <BiArchive className="text-2xl text-[#666] group-hover:text-purple-500 mb-3 mx-auto transition-colors" />
             <h4 className="text-white font-bold text-sm">Loops</h4>
          </Link>
       </div>

       <Link to="/explorar" className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors">
          Explorar Marketplace
       </Link>
    </div>
  );
}