import React, { useState } from 'react';
import {
    Ticket, Plus, Search, Filter,
    MoreVertical, Pencil, Trash2,
    Calendar, Tag, MousePointer2,
    Loader2, ArrowLeft, AlertCircle,
    CheckCircle2, Clock, XCircle,
    Package, ShoppingCart, TrendingUp,
    ChevronRight, Sparkles, Percent,
    DollarSign, Zap, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCoupons } from '../../../hooks/useCoupons';
import CouponModal from '../../../components/dashboard/CouponModal';

const FILTERS = [
    { id: 'all', label: 'Todos', icon: Ticket },
    { id: 'active', label: 'Activos', icon: CheckCircle2 },
    { id: 'scheduled', label: 'Programados', icon: Clock },
    { id: 'expired', label: 'Expirados', icon: XCircle }
];

export default function Coupons() {
    const navigate = useNavigate();
    const { coupons, loading, saveCoupon, deleteCoupon } = useCoupons();

    const [activeFilter, setActiveFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [saving, setSaving] = useState(false);

    const filteredCoupons = coupons.filter(c =>
        activeFilter === 'all' ? true : c.status === activeFilter
    );

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.status === 'active').length,
        scheduled: coupons.filter(c => c.status === 'scheduled').length
    };

    const handleCreate = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        setSaving(true);
        const success = await saveCoupon(data);
        if (success) setIsModalOpen(false);
        setSaving(false);
    };

    if (loading && coupons.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-t-2 border-violet-500 rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
                    <Tag className="absolute inset-0 m-auto text-violet-500 animate-pulse" size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Indexando Campañas...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1500px] mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* --- HERO HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 text-gray-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/10"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                            <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Growth</span>
                        </div>
                        <div className="h-px w-8 bg-white/5"></div>
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
                        Marketing <span className="text-violet-500">Center</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                        <Tag size={12} className="text-violet-500" /> Fidelización, drops y campañas de conversión impulsada
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="group flex items-center gap-4 px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    Nueva Campaña
                </button>
            </div>

            {/* --- METRICS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatBox label="Total Cupones" value={stats.total} sub="Inventario histórico" icon={Ticket} color="text-violet-500" />
                <StatBox label="Campañas Activas" value={stats.active} sub="Impactando ventas" icon={TrendingUp} color="text-emerald-500" />
                <StatBox label="Próximas" value={stats.scheduled} sub="Programadas para drop" icon={Clock} color="text-amber-500" />
            </div>

            {/* --- CONTROL BAR --- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-3 bg-[#0A0A0A] border border-white/5 rounded-[32px] shadow-inner backdrop-blur-xl">
                <div className="flex p-1 bg-black/40 rounded-[22px] border border-white/5 overflow-x-auto no-scrollbar w-full md:w-auto">
                    {FILTERS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveFilter(id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${activeFilter === id
                                ? 'bg-white text-black shadow-2xl scale-[1.02]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-4 pr-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                        Mostrando <span className="text-violet-500">{filteredCoupons.length}</span> activos
                    </div>
                    <div className="h-4 w-px bg-white/5" />
                    <Sparkles size={14} className="text-violet-500/30" />
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredCoupons.length === 0 ? (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 rounded-[60px] text-center space-y-8 animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <Ticket size={48} className="text-gray-800 opacity-20" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Resultados Nulos</h3>
                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] max-w-xs mx-auto">No logramos indexar campañas en este sector del Hub.</p>
                        </div>
                    </div>
                ) : (
                    filteredCoupons.map((coupon) => (
                        <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            onEdit={handleEdit}
                            onDelete={deleteCoupon}
                        />
                    ))
                )}
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingCoupon={editingCoupon}
                saving={saving}
            />
        </div>
    );
}

function StatBox({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] flex items-center justify-between group hover:border-white/10 transition-all hover:bg-white/[0.02] relative overflow-hidden shadow-2xl">
            <div className="space-y-4 relative z-10">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</span>
                    <div className="text-5xl font-black tracking-tighter text-white leading-none">{value}</div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" /> {sub}
                </div>
            </div>
            <div className={`p-6 rounded-3xl bg-white/[0.02] border border-white/5 ${color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative z-10 shadow-2xl shadow-black/80`}>
                <Icon size={32} />
            </div>
            <Icon size={160} className="absolute -right-8 -bottom-8 text-white opacity-[0.01] pointer-events-none group-hover:scale-120 group-hover:rotate-12 transition-all duration-1000" />
        </div>
    );
}

function CouponCard({ coupon, onEdit, onDelete }) {
    const isPercent = coupon.discount_percent !== null;
    const value = isPercent ? `${coupon.discount_percent}%` : `$${coupon.discount_amount}`;

    const statusData = {
        active: { label: 'Activo', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        scheduled: { label: 'Programado', color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
        expired: { label: 'Expirado', color: 'text-gray-700', bg: 'bg-white/5', border: 'border-white/5' }
    }[coupon.status];

    const formatDate = (dateStr) => {
        if (!dateStr) return 'OPEN';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase();
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden group hover:border-white/10 transition-all duration-700 flex flex-col relative shadow-2xl">
            <div className={`absolute top-0 right-0 w-48 h-48 bg-violet-600/5 blur-[80px] pointer-events-none group-hover:bg-violet-600/10 transition-all duration-700`}></div>

            {/* --- CARD HEADER --- */}
            <div className="p-10 pb-4 flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <div className="px-6 py-2 bg-black border border-white/5 rounded-2xl text-[10px] font-black text-white tracking-[0.3em] uppercase flex items-center gap-3 group-hover:border-violet-500/30 group-hover:text-violet-500 transition-all duration-500 shadow-inner">
                        <Tag size={12} className="group-hover:rotate-12 transition-transform" />
                        {coupon.code}
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusData.bg} ${statusData.color} ${statusData.border} shadow-lg shadow-black/40`}>
                    {statusData.label}
                </div>
            </div>

            {/* --- CARD BODY --- */}
            <div className="p-10 pt-6 space-y-10 flex-1 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-black text-white tracking-tighter group-hover:scale-[1.02] transition-transform origin-left duration-700 italic">{value}</span>
                        <span className="text-[12px] font-black text-gray-800 uppercase tracking-[0.4em] mb-2">Benefit</span>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 flex items-center gap-2">
                            <Calendar size={12} className="text-violet-500/30" /> Validez
                        </div>
                        <div className="text-[11px] font-black text-white tracking-tighter">
                            {formatDate(coupon.valid_from)} — {formatDate(coupon.valid_to)}
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 flex items-center gap-2 justify-end">
                            Alcance <Package size={12} className="text-violet-500/30" />
                        </div>
                        <div className="text-[11px] font-black text-white uppercase tracking-tighter truncate">
                            {coupon.applies_to === 'all' ? 'FULL STORE' : (coupon.applies_to === 'category' ? coupon.applies_to_id : 'SPECIFIC')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    {coupon.min_purchase_amount > 0 ? (
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-violet-400 bg-violet-500/5 px-4 py-2 rounded-xl border border-violet-500/10 shadow-lg shadow-black/80">
                            <ShoppingCart size={12} /> Min: ${coupon.min_purchase_amount}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-800 italic">
                            <Zap size={12} className="text-amber-500/30" /> Sin mínimo requerido
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-800">
                        Usos: <span className="text-white bg-white/5 px-2 py-1 rounded-md">{coupon.uses_limit ? `0 / ${coupon.uses_limit}` : '∞'}</span>
                    </div>
                </div>
            </div>

            {/* --- CARD FOOTER --- */}
            <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-end items-center gap-4 transition-colors relative z-10 group-hover:bg-white/[0.02]">
                <button
                    onClick={() => onEdit(coupon)}
                    className="p-5 bg-white/5 text-gray-700 hover:text-white hover:bg-violet-500 rounded-2xl transition-all duration-300 active:scale-90 group/btn shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5"
                    title="Configuración"
                >
                    <Pencil size={20} className="group-hover/btn:rotate-12 transition-transform" />
                </button>
                <button
                    onClick={() => onDelete(coupon.id)}
                    className="p-5 bg-white/5 text-gray-800 hover:text-white hover:bg-red-500 rounded-2xl transition-all duration-300 active:scale-90 group/btn shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5"
                    title="Destruir Campaña"
                >
                    <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
}
