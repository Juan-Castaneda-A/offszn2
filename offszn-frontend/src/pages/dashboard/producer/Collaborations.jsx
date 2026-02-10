import React, { useState } from 'react';
import {
    Users, Send, Inbox, ShieldCheck,
    XCircle, CheckCircle2, MoreVertical,
    ArrowLeft, Plus, BarChart3, Info,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCollaborations } from '../../../hooks/useCollaborations';
import CollabInviteModal from '../../../components/dashboard/CollabInviteModal';

const TABS = [
    { id: 'received', label: 'Recibidas', icon: Inbox },
    { id: 'sent', label: 'Enviadas', icon: Send },
    { id: 'active', label: 'Activas', icon: ShieldCheck },
    { id: 'rejected', label: 'Rechazos', icon: XCircle }
];

export default function Collaborations() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('received');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        invites, products, loading,
        respondToInvite, saveSplits
    } = useCollaborations();

    const handleSaveSplits = async (productId, splits) => {
        setSaving(true);
        const success = await saveSplits(productId, splits);
        if (success) {
            setIsModalOpen(false);
        }
        setSaving(false);
    };

    const currentList = invites[activeTab] || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-violet-500" size={40} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Cargando Colaboraciones...</span>
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
                        <Users className="text-violet-500" size={32} />
                        Colaboraciones
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Gestiona repartos de royalties y colaboraciones con otros productores
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus size={16} />
                    Nueva Colaboración
                </button>
            </div>

            {/* Main Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Colaboradores Activos"
                    value={invites.active.length}
                    icon={Users}
                    color="text-violet-500"
                />
                <StatCard
                    label="Proyectos en Split"
                    value={new Set(invites.active.map(i => i.product_id)).size}
                    icon={ShieldCheck}
                    color="text-emerald-500"
                />
                <StatCard
                    label="Invitaciones Pendientes"
                    value={invites.received.length + invites.sent.length}
                    icon={Inbox}
                    color="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,300px] gap-10">

                {/* Left: Lists */}
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-[#0a0a0a] rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon size={14} />
                                {label}
                                <span className={`ml-1 text-[10px] ${activeTab === id ? 'text-black/40' : 'text-white/20'}`}>
                                    {invites[id]?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content List */}
                    <div className="space-y-4">
                        {currentList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] border border-white/5 rounded-[40px] text-gray-600 gap-4">
                                <Users size={40} className="opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No hay colaboraciones en esta sección</p>
                            </div>
                        ) : (
                            currentList.map((item) => (
                                <CollabCard
                                    key={item.id}
                                    item={item}
                                    type={activeTab}
                                    onRespond={respondToInvite}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Info/Help */}
                <div className="space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Info size={120} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-violet-500 flex items-center gap-2">
                            <Info size={14} /> ¿Cómo funciona?
                        </h3>
                        <p className="text-gray-500 text-[11px] font-bold leading-relaxed uppercase">
                            Invita a otros productores a tus beats. Define el porcentaje de regalías (split) y cuando acepten, se reflejará automáticamente en los contratos de licencia y distribución de ingresos.
                        </p>
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <HelpItem text="Suma exacta del 100%" />
                            <HelpItem text="Invitación vía Email" />
                            <HelpItem text="Contratos Automáticos" />
                        </div>
                    </div>
                </div>
            </div>

            <CollabInviteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={products}
                onSave={handleSaveSplits}
                saving={saving}
            />
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] flex items-center justify-between group hover:border-white/10 transition-all hover:bg-white/[0.02]">
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                <div className="text-3xl font-black tracking-tighter text-white">{value}</div>
            </div>
            <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function HelpItem({ text }) {
    return (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
            <CheckCircle2 size={12} className="text-violet-500" />
            {text}
        </div>
    );
}

function CollabCard({ item, type, onRespond }) {
    const isReceived = type === 'received';
    const otherUser = isReceived ? item.inviter : item.collaborator;
    const isAccepted = item.status === 'accepted';

    return (
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[32px] flex items-center justify-between group hover:bg-white/[0.01] transition-all">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/5 flex-shrink-0 relative">
                    {(item.products.cover_url || item.products.image_url) ? (
                        <img
                            src={item.products.cover_url || item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <Users size={24} />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="text-sm font-black uppercase tracking-tighter text-white group-hover:text-violet-400 transition-colors">
                        {item.products.name}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-500">
                            {isReceived ? 'Invitado por:' : 'Colaborador:'}
                        </span>
                        <span className="text-[10px] font-black uppercase text-violet-500/80 bg-violet-500/5 px-2 py-0.5 rounded-md">
                            {otherUser.nickname || otherUser.email}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-right">
                    <div className="text-xl font-black text-white">{item.royalty_split}%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Split</div>
                </div>

                {isReceived && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onRespond(item.id, 'rejected')}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                            title="Rechazar"
                        >
                            <XCircle size={18} />
                        </button>
                        <button
                            onClick={() => onRespond(item.id, 'accepted')}
                            className="p-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-90"
                            title="Aceptar"
                        >
                            <CheckCircle2 size={18} />
                        </button>
                    </div>
                )}

                {!isReceived && item.status === 'pending' && (
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500/70">
                        Pendiente
                    </div>
                )}

                {isAccepted && (
                    <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Activa
                    </div>
                )}

                {/* Actions dropdown placeholder */}
                <button className="p-3 text-gray-700 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
