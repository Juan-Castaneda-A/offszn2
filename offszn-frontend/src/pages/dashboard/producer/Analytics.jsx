import React, { useState } from 'react';
import {
    BarChart3, Eye, ShoppingBag, DollarSign,
    Activity, DownloadCloud, PlayCircle,
    ArrowLeft, Calendar, TrendingUp, Trophy,
    Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../../../hooks/useAnalytics';
import PerformanceChart from '../../../components/dashboard/PerformanceChart';

const PERIODS = [
    { id: '7d', label: 'Últimos 7 días' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: 'all', label: 'Todo el tiempo' }
];

export default function Analytics() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('30d');
    const { metrics, chartData, topProducts, loading } = useAnalytics(period);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-8 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft size={14} />
                        Volver al Dashboard
                    </button>
                    <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                        <BarChart3 className="text-violet-500" size={32} />
                        Analíticas
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Monitorea el rendimiento de tus beats y conversiones en tiempo real
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex p-1 bg-[#0a0a0a] rounded-2xl border border-white/5">
                    {PERIODS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard
                    label="Visitas"
                    value={metrics.views}
                    icon={Eye}
                    color="text-blue-500"
                    loading={loading}
                />
                <MetricCard
                    label="Ventas"
                    value={metrics.sales}
                    icon={ShoppingBag}
                    color="text-emerald-500"
                    loading={loading}
                />
                <MetricCard
                    label="Ingresos"
                    value={`$${metrics.revenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="text-amber-500"
                    loading={loading}
                />
                <MetricCard
                    label="Conversión"
                    value={`${metrics.conversion}%`}
                    icon={Activity}
                    color="text-violet-500"
                    loading={loading}
                />
                <MetricCard
                    label="Free DLs"
                    value={metrics.freeDownloads}
                    icon={DownloadCloud}
                    color="text-rose-500"
                    loading={loading}
                />
                <MetricCard
                    label="Reels Views"
                    value={metrics.reelsViews}
                    icon={PlayCircle}
                    color="text-fuchsia-500"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,350px] gap-8">

                {/* Main Interaction Chart */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-8 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                            <TrendingUp size={14} /> Tendencias de Rendimiento
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                <span className="text-gray-500">Visitas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-gray-500">Ventas</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[400px]">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-violet-500" size={32} />
                            </div>
                        ) : (
                            <PerformanceChart
                                labels={chartData.labels}
                                viewsData={chartData.views}
                                salesData={chartData.sales}
                            />
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                        <Trophy size={14} /> Top Beats
                    </h3>

                    <div className="space-y-4">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/5 rounded w-2/3"></div>
                                        <div className="h-2 bg-white/5 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : topProducts.length > 0 ? (
                            topProducts.map((p, index) => (
                                <div key={p.id} className="flex items-center gap-4 group">
                                    <div className="relative">
                                        <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-lg ${index === 0 ? 'bg-[#FFD700] text-black' :
                                                index === 1 ? 'bg-[#C0C0C0] text-black' :
                                                    index === 2 ? 'bg-[#CD7F32] text-black' :
                                                        'bg-white/10 text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                                            <img
                                                src={p.image || '/images/PORTADA%20DEFAULT.png'}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-black uppercase tracking-tight text-white truncate">{p.name}</div>
                                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{p.sales} Ventas</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-500">${p.revenue.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <AlertCircle className="mx-auto text-gray-800" size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">No hay datos de ventas en este periodo</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-500">
                                <Activity size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tasa Global</div>
                                <div className="text-sm font-black text-white">{metrics.conversion}% Conversión</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color, loading }) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[32px] group hover:bg-white/[0.02] transition-all hover:border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                    Real-Time
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                    {label}
                </div>
                {loading ? (
                    <div className="h-8 w-16 bg-white/5 rounded animate-pulse"></div>
                ) : (
                    <div className="text-2xl font-black tracking-tighter text-white">
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}
