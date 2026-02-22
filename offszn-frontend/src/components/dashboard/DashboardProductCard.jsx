import React from 'react';
import {
    MoreVertical, Edit3, Trash2, Eye, EyeOff, Link,
    Clock, CheckCircle, Copy, AlertCircle, Music, Disc
} from 'lucide-react';

export default function DashboardProductCard({
    item,
    isSelected,
    onToggleSelection,
    onEdit,
    onDelete,
    onUpdateVisibility
}) {
    const isDraft = item.isDraft;
    const visibility = item.visibility;
    const title = item.title || item.name || 'Sin título';
    const imageUrl = item.image_url || item.signed_cover_url || '/images/portada-default.png';

    const getVisibilityColor = () => {
        if (isDraft) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        switch (visibility) {
            case 'public': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'private': return 'text-gray-400 bg-white/5 border-white/10';
            case 'unlisted': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-500 bg-white/5 border-white/10';
        }
    };

    const getVisibilityLabel = () => {
        if (isDraft) return 'Borrador';
        switch (visibility) {
            case 'public': return 'Público';
            case 'private': return 'Privado';
            case 'unlisted': return 'Oculto';
            default: return 'Unknown';
        }
    };

    return (
        <div className={`group relative bg-[#0A0A0A] border ${isSelected ? 'border-violet-500 ring-1 ring-violet-500/20' : 'border-white/5'} rounded-[40px] overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]`}>

            {/* Selection Checkbox */}
            <div className={`absolute top-6 left-6 z-20 transition-all duration-500 ${isSelected ? 'opacity-100 scale-110' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                <button
                    onClick={() => onToggleSelection(item.id)}
                    className={`w-8 h-8 rounded-2xl border flex items-center justify-center transition-all backdrop-blur-md ${isSelected ? 'bg-violet-500 border-violet-500 shadow-lg shadow-violet-500/40' : 'bg-black/40 border-white/20 hover:border-white/40'}`}
                >
                    {isSelected && <CheckCircle size={16} className="text-white" />}
                    {!isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                </button>
            </div>

            {/* Thumbnail Box */}
            <div className="aspect-square relative overflow-hidden m-2 rounded-[32px]">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                {/* Quick Actions Hover Box */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-[4px]">
                    <ActionButton icon={Edit3} onClick={() => onEdit(item)} label="Editar" variant="light" delay="delay-0" />
                    <ActionButton icon={Trash2} onClick={() => onDelete(item)} label="Borrar" variant="danger" delay="delay-[50ms]" />
                    <ActionButton icon={Copy} onClick={() => { }} label="Duplicar" variant="glass" delay="delay-[100ms]" />
                </div>

                {/* Type Badge (Bottom Left) */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                    {item.product_type === 'beat' ? <Music size={10} className="text-violet-500" /> : <Disc size={10} className="text-violet-500" />}
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
                        {item.product_type || 'Item'}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white line-clamp-2 leading-tight flex-1">
                            {title}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-colors ${getVisibilityColor()}`}>
                            {getVisibilityLabel()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Bento Slot: Tempo/Key */}
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Ritmo</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                            {item.bpm || '--'} <span className="text-[8px] text-gray-700">BPM</span>
                        </div>
                    </div>

                    {/* Bento Slot: Price */}
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Precio</span>
                        <div className="text-[10px] font-black text-violet-400">
                            ${parseFloat(item.price || 0).toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-1">
                        {(item.tags || []).slice(0, 3).map((tag, i) => (
                            <div key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[7px] font-black uppercase tracking-tight text-gray-500">
                                {tag}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={10} />
                        <span className="text-[8px] font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, onClick, label, variant, delay }) {
    const variants = {
        light: "bg-white text-black hover:bg-violet-500 hover:text-white",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20",
        glass: "bg-white/10 text-white hover:bg-white/20 border border-white/20"
    };

    return (
        <button
            onClick={onClick}
            className={`p-3.5 rounded-2xl shadow-2xl transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 ${delay} ${variants[variant]}`}
            title={label}
        >
            <Icon size={18} />
        </button>
    );
}
