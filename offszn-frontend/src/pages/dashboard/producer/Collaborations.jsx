import React, { useState } from 'react';
import {
    Users, Send, Inbox, ShieldCheck,
    XCircle, CheckCircle2, MoreVertical,
    ArrowLeft, Plus, BarChart3, Info,
    Loader2, Sparkles, ChevronRight,
    Zap, ExternalLink
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-t-2 border-violet-500 rounded-full animate-spin"></div>
                    <Users className="absolute inset-0 m-auto text-violet-500 animate-pulse" size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Sincronizando Alianzas...</span>
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
                            <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Negocio</span>
                        </div>
                        <div className="h-px w-8 bg-white/5"></div>
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
                        Hub de <span className="text-violet-500">Collab</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                        <Users size={12} className="text-violet-500" /> División de royalties y gestión de autoría compartida
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center gap-4 px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    Invitar Socio
                </button>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    label="Alianzas Activas"
                    value={invites.active.length}
                    sub="Proyectos confirmados"
                    icon={ShieldCheck}
                    color="text-emerald-500"
                />
                <StatCard
                    label="Impacto en Catálogo"
                    value={`${new Set(invites.active.map(i => i.product_id)).size} Items`}
                    sub="Bajo esquema de split"
                    icon={BarChart3}
                    color="text-violet-500"
                />
                <StatCard
                    label="Buzón de Invitaciones"
                    value={invites.received.length}
                    sub="Pendientes por revisar"
                    icon={Inbox}
                    color="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,350px] gap-12">

                {/* --- LEFT: COLLABORATION LISTS --- */}
                <div className="space-y-10">
                    <div className="flex p-1.5 bg-[#0A0A0A] rounded-[24px] border border-white/5 w-fit overflow-x-auto no-scrollbar shadow-inner">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === id ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon size={16} />
                                {label}
                                <span className={`ml-2 px-2 py-0.5 rounded-md text-[9px] ${activeTab === id ? 'bg-black/10 text-black' : 'bg-white/5 text-white/30'}`}>
                                    {invites[id]?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {currentList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-[#0A0A0A] border border-white/5 rounded-[60px] text-gray-700 space-y-6 animate-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <Users size={40} className="opacity-10" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic max-w-xs text-center">
                                    El registro de esta zona está vacío por el momento.
                                </p>
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

                {/* --- RIGHT: INFO & EDUCATION --- */}
                <div className="space-y-8">
                    <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] space-y-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:scale-125 transition-all duration-1000 rotate-12">
                            <Sparkles size={200} />
                        </div>

                        <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 mb-6">
                            <Info size={24} className="text-violet-500" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Protocolo Split</h3>
                            <p className="text-gray-500 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                                Registra formalmente a tus colaboradores para asegurar que cada venta se distribuya con transparencia absoluta.
                            </p>
                        </div>

                        <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                            <HelpItem text="Validación de Identidad" />
                            <HelpItem text="Ajuste de % en Tiempo Real" />
                            <HelpItem text="Contratos Vinculantes" />
                        </div>

                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3 group">
                            Leer Documentación <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
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

function StatCard({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] flex items-center justify-between group hover:border-white/10 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="space-y-4 relative z-10">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</span>
                    <div className="text-5xl font-black tracking-tighter text-white leading-none">{value}</div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> {sub}
                </div>
            </div>
            <div className={`p-6 rounded-3xl bg-white/[0.02] border border-white/5 ${color} group-hover:scale-110 transition-all duration-700 relative z-10 shadow-2xl`}>
                <Icon size={32} />
            </div>
        </div>
    );
}

function HelpItem({ text }) {
    return (
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="w-2 h-2 rounded-full bg-violet-500/50" />
            {text}
        </div>
    );
}

function CollabCard({ item, type, onRespond }) {
    const isReceived = type === 'received';
    const otherUser = isReceived ? item.inviter : item.collaborator;
    const isAccepted = item.status === 'accepted';

    return (
        <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between group hover:bg-white/[0.02] hover:border-white/10 transition-all duration-500 gap-8">
            <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-24 h-24 rounded-[32px] bg-black overflow-hidden border border-white/5 flex-shrink-0 shadow-2xl relative group-hover:scale-105 transition-transform duration-700">
                    {(item.products.cover_url || item.products.image_url) ? (
                        <img
                            src={item.products.cover_url || item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-800">
                            <Music size={32} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="space-y-3">
                    <div className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-violet-500 transition-colors leading-none">
                        {item.products.name}
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">
                            {isReceived ? 'Invitado por:' : 'Colaborador:'}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <Users size={12} className="text-violet-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">
                                {otherUser.nickname || otherUser.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                <div className="text-center bg-white/[0.02] border border-white/5 px-8 py-4 rounded-3xl min-w-[120px]">
                    <div className="text-4xl font-black text-white leading-none mb-1">{item.royalty_split}%</div>
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">Participación</div>
                </div>

                <div className="flex items-center gap-3">
                    {isReceived && item.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onRespond(item.id, 'rejected')}
                                className="p-4 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/10 transition-all active:scale-90 group"
                                title="Rechazar Alianza"
                            >
                                <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={() => onRespond(item.id, 'accepted')}
                                className="p-4 bg-emerald-500 text-black hover:bg-emerald-400 rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95 group"
                                title="Aceptar Alianza"
                            >
                                <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    {!isReceived && item.status === 'pending' && (
                        <div className="px-6 py-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/90 shadow-lg shadow-amber-500/5">
                            Pendiente
                        </div>
                    )}

                    {isAccepted && (
                        <div className="px-6 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 shadow-lg shadow-emerald-500/5 flex items-center gap-2">
                            <ShieldCheck size={14} /> Activa
                        </div>
                    )}

                    <button className="p-4 text-gray-800 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
