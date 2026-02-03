import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Filler, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  BiPlus, 
  BiFilter, 
  BiEnvelope, 
  BiCheckCircle, 
  BiErrorCircle,
  BiMusic,
  BiDisc,
  BiDollarCircle,
  BiGroup,
  BiGear,
  BiRightArrowAlt
} from 'react-icons/bi';
// Asumiendo que tienes configurado tu cliente de supabase
import { supabase } from '../../supabase/client'; 

// --- CONFIGURACIÓN DE CHART.JS ---
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false, color: '#333' }, ticks: { color: '#666' } },
    y: { display: false }
  },
  elements: {
    line: { tension: 0.4 },
    point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
  }
};

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Productor', id: null });
  const [stats, setStats] = useState({ revenue: 0, sales: 0, plays: 0, clients: 0 });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState(null);

  // --- EFECTO: CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener Usuario
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return; // Redirigir si es necesario

        // Obtener perfil (nickname)
        const { data: profile } = await supabase
          .from('users')
          .select('nickname, first_name')
          .eq('id', authUser.id)
          .single();

        const displayName = profile?.nickname || profile?.first_name || authUser.email.split('@')[0];
        setUser({ name: displayName, id: authUser.id });

        // 2. Obtener Estadísticas (Revenue, Sales, etc)
        // Nota: Adaptado de tu script original. En producción, idealmente usarías RPCs o Edge Functions para sumar.
        const { data: orders } = await supabase
          .from('orders')
          .select('amount, created_at, user_id')
          .eq('producer_id', authUser.id);
        
        const { data: products } = await supabase
          .from('products')
          .select('views')
          .eq('producer_id', authUser.id);

        let totalRev = 0;
        let monthSales = 0;
        let totalPlays = 0;
        const uniqueClients = new Set();
        const now = new Date();

        if (orders) {
          orders.forEach(o => {
            totalRev += parseFloat(o.amount || 0);
            if (o.user_id) uniqueClients.add(o.user_id);
            const d = new Date(o.created_at);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
              monthSales++;
            }
          });
        }

        if (products) {
          products.forEach(p => totalPlays += (p.views || 0));
        }

        setStats({
          revenue: totalRev,
          sales: monthSales,
          plays: totalPlays,
          clients: uniqueClients.size
        });

        // 3. Obtener Actividad (Products + Orders)
        // Simplificado para el ejemplo: combinamos y ordenamos
        const { data: recentProds } = await supabase
          .from('products')
          .select('*')
          .eq('producer_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(3);

        const feed = [];
        if (recentProds) recentProds.forEach(p => feed.push({
          type: 'product',
          title: p.name,
          desc: 'Nuevo Lanzamiento',
          date: new Date(p.created_at),
          img: p.image_url,
          category: p.product_type
        }));
        
        // Agregar las órdenes al feed también...
        // Ordenar por fecha
        feed.sort((a, b) => b.date - a.date);
        setActivities(feed);

        // 4. Datos de la Gráfica (Mockeado basado en lógica de visitas)
        // Aquí generarías los labels de los últimos 7 días
        const labels = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('es-ES', { weekday: 'short' });
        });

        setChartData({
          labels,
          datasets: [{
            label: 'Visitas',
            data: [12, 19, 3, 5, 2, 3, 15], // Mock data si no hay page_views real
            borderColor: '#8B5CF6',
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
              gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
              return gradient;
            },
            fill: true,
          }]
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start">
        <div>
          {loading ? (
            <div className="h-8 w-64 bg-[#1A1A1A] animate-pulse rounded mb-2"></div>
          ) : (
            <h1 className="text-3xl font-bold font-jakarta text-white tracking-tight">
              Bienvenido, <span className="text-white">{user.name}</span>
            </h1>
          )}
          <p className="text-[#888] text-sm mt-1">Este es el estado actual de tu catálogo musical.</p>
          
          {/* Smart Drafts Pills (Static Example) */}
          <div className="flex gap-3 mt-4">
             <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[#222] text-xs text-[#ccc] hover:bg-[rgba(255,255,255,0.1)] hover:text-white hover:border-[#444] transition-all">
                <BiMusic className="text-[#8B5CF6]" /> Continuar: Dark Trap Beat
             </button>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl border border-[#333] hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all">
          <BiPlus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* --- BENTO STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard loading={loading} label="Ingresos Totales" value={`$${stats.revenue}`} trend="Histórico" trendType="neutral" />
        <StatCard loading={loading} label="Ventas Mes" value={stats.sales} trend="Mes Actual" trendType="up" />
        <StatCard loading={loading} label="Plays Totales" value={stats.plays} trend="Global" trendType="neutral" />
        <StatCard loading={loading} label="Clientes Únicos" value={stats.clients} />
      </div>

      {/* --- CHART SECTION --- */}
      <div className="w-full h-[300px] p-5 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl relative">
        <h4 className="text-sm text-[#888] mb-4">Tendencia de Audiencia (Últimos 7 días)</h4>
        {loading || !chartData ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-full w-full bg-[#111] animate-pulse rounded-xl opacity-20"></div>
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* --- WORKSPACE SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* Left: Activity Feed */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-[#eee]">Actividad Reciente</h3>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#333] text-[#888] hover:text-white hover:border-[#666] transition-all">
              <BiFilter />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {loading ? (
              [1,2,3].map(i => <ActivitySkeleton key={i} />)
            ) : activities.length > 0 ? (
              activities.map((item, idx) => <ActivityItem key={idx} data={item} />)
            ) : (
              <div className="text-center py-10 border border-[#1A1A1A] rounded-2xl bg-[#0F0F0F]">
                 <p className="text-[#444] text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Management Sidebar */}
        <aside className="flex flex-col gap-6">
          
          {/* Licenses Panel */}
          <div className="p-6 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl">
            <h4 className="flex justify-between items-center text-xs uppercase tracking-wider text-[#888] mb-5">
              Mis Licencias
              <span className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-[#888] hover:text-white rounded cursor-pointer transition-all text-[10px]">Ajustar</span>
            </h4>
            <div className="space-y-3">
              <LicenseRow name="MP3 Lease" price={20} />
              <LicenseRow name="WAV Lease" price={50} />
              <LicenseRow name="Unlimited" price={300} />
            </div>
          </div>

          {/* Status Panel */}
          <div className="p-6 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl">
            <h4 className="text-xs uppercase tracking-wider text-[#888] mb-5">Estado</h4>
            
            <div className="flex items-center justify-between bg-[#151515] p-3 rounded-lg text-sm text-[#ccc] mb-4">
               <div className="flex items-center gap-2">
                 <BiGear className="text-lg" />
                 <span>Pagos (Stripe)</span>
               </div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#222] text-[#bbb] text-sm cursor-pointer hover:text-white transition-colors">
              <BiEnvelope />
              <span>Mensajes</span>
              <span className="ml-auto bg-[#8B5CF6] text-white text-[10px] font-bold px-1.5 rounded-full">0</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES (Para mantener el código limpio) ---

function StatCard({ loading, label, value, trend, trendType }) {
  if (loading) {
    return <div className="h-[140px] bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="h-[140px] p-6 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl flex flex-col justify-between hover:border-[#8B5CF6] hover:bg-[rgba(255,255,255,0.02)] transition-all group relative overflow-hidden">
      <span className="text-[13px] text-[#888] font-medium uppercase tracking-wide">{label}</span>
      <div>
        <span className="block text-3xl font-bold font-jakarta text-white">{value}</span>
        {trend && (
           <span className={`text-xs font-semibold mt-1 block ${trendType === 'up' ? 'text-emerald-500' : 'text-[#666]'}`}>
             {trend}
           </span>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ data }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#1A1A1A] hover:bg-[#111] transition-colors cursor-pointer rounded-lg">
      {/* Thumbnail */}
      {data.img ? (
        <img src={data.img} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#222]" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-[rgba(16,185,129,0.1)] text-emerald-500 flex items-center justify-center text-xl">
           <BiDollarCircle />
        </div>
      )}
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h5 className="text-[15px] font-semibold text-white truncate">{data.title}</h5>
        <p className="text-[13px] text-[#666] truncate">{data.desc}</p>
      </div>

      {/* Date & Badge */}
      <span className="text-[13px] text-[#555] whitespace-nowrap">{data.date.toLocaleDateString()}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888] uppercase">{data.category || data.type}</span>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#1A1A1A]">
      <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-[#1A1A1A] animate-pulse rounded"></div>
        <div className="h-3 w-48 bg-[#1A1A1A] animate-pulse rounded"></div>
      </div>
    </div>
  );
}

function LicenseRow({ name, price }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#aaa]">{name}</span>
      <span className="text-white font-bold font-jakarta">${price}</span>
    </div>
  );
}