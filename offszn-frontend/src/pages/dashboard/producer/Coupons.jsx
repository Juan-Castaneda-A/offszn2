import React, { useState } from 'react';
import {
    Ticket, Plus, Search, Filter,
    MoreVertical, Pencil, Trash2,
    Calendar, Tag, MousePointer2,
    Loader2, ArrowLeft, AlertCircle,
    CheckCircle2, Clock, XCircle
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-violet-500" size={40} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Cargando Cupones...</span>
            </div>
        );
    }

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
                        <Ticket className="text-violet-500" size={32} />
                        Cupones
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Crea y gestiona códigos de descuento para tus producciones
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus size={16} />
                    Crear Nuevo Cupón
                </button>
            </div>

            {/* Stats Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Total Cupones" value={stats.total} icon={Ticket} color="text-gray-400" />
                <StatBox label="Campaña Activa" value={stats.active} icon={CheckCircle2} color="text-emerald-500" />
                <StatBox label="Programados" value={stats.scheduled} icon={Clock} color="text-amber-500" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5">
                <div className="flex p-1 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                    {FILTERS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveFilter(id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeFilter === id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-[#0a0a0a] px-4 py-2 rounded-full border border-white/5">
                    <Filter size={12} />
                    Mostrando: {filteredCoupons.length}
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCoupons.length === 0 ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/5 rounded-[40px] text-gray-700 space-y-4">
                        <Ticket size={48} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">No se encontraron cupones en esta categoría</p>
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

function StatBox({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[32px] flex items-center gap-6 group hover:border-white/10 transition-all">
            <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</div>
                <div className="text-3xl font-black text-white">{value}</div>
            </div>
        </div>
    );
}

function CouponCard({ coupon, onEdit, onDelete }) {
    const isPercent = coupon.discount_percent !== null;
    const value = isPercent ? `${coupon.discount_percent}%` : `$${coupon.discount_amount}`;

    const statusData = {
        active: { label: 'Activo', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        scheduled: { label: 'Programado', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        expired: { label: 'Expirado', color: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/10' }
    }[coupon.status];

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Infinito';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-[#090909] border border-white/5 rounded-[32px] overflow-hidden group hover:bg-white/[0.01] hover:border-white/10 transition-all flex flex-col">
            {/* Card Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[14px] font-black text-white tracking-widest uppercase flex items-center gap-2 group-hover:text-violet-400 transition-colors">
                        <Tag size={12} />
                        {coupon.code}
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusData.bg} ${statusData.color} ${statusData.border}`}>
                    {statusData.label}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 pt-2 space-y-6 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">OFF</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                        <div className="text-[9px] font-black uppercase text-gray-600 flex items-center gap-1">
                            <Calendar size={10} /> Validez
                        </div>
                        <div className="text-[10px] font-bold text-gray-300">
                            {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[9px] font-black uppercase text-gray-600 flex items-center gap-1">
                            <Package size={10} /> Aplica a
                        </div>
                        <div className="text-[10px] font-bold text-gray-300 uppercase truncate">
                            {coupon.applies_to === 'all' ? 'Todo' : (coupon.applies_to === 'category' ? coupon.applies_to_id : 'Específico')}
                        </div>
                    </div>
                </div>

                {coupon.min_purchase_amount > 0 && (
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-violet-500/70">
                        <ShoppingCart size={10} /> Compra mínima: ${coupon.min_purchase_amount}
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                    <MousePointer2 size={12} />
                    {coupon.uses_limit ? `0 / ${coupon.uses_limit}` : 'Ilimitado'}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(coupon)}
                        className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Editar"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(coupon.id)}
                        className="p-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
