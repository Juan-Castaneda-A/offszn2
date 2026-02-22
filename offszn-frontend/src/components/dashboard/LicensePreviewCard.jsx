import React from 'react';
import {
    Music, ShoppingCart, Radio, FileAudio,
    CheckCircle2, XCircle, Globe, Headphones,
    ShieldAlert, Sparkles, Disc, Zap
} from 'lucide-react';

export default function LicensePreviewCard({
    name,
    price,
    usage = {},
    files = {},
    isEnabled = true
}) {
    const formatValue = (val) => {
        if (!val) return '0';
        if (val === 'UNLIMITED' || val === 'ILIMITADO') return '∞';
        const num = parseInt(val);
        if (isNaN(num)) return val;
        if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toLocaleString();
    };

    const fileList = [];
    fileList.push('MP3');
    if (files.wav) fileList.push('WAV');
    if (files.stems) fileList.push('STEMS');

    const displayPrice = parseFloat(price || 0);
    const wholePart = Math.floor(displayPrice);
    const fractionalPart = (displayPrice % 1).toFixed(2).split('.')[1];

    return (
        <div className={`group relative w-full bg-[#070707] border ${isEnabled ? 'border-white/10' : 'border-red-500/20'} rounded-[48px] overflow-hidden shadow-2xl transition-all duration-700 hover:border-white/20`}>

            {/* Background Accent */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-violet-600/10 blur-[100px] pointer-events-none transition-opacity duration-700 ${isEnabled ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Disabled Overlay */}
            {!isEnabled && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="px-6 py-2 border border-red-500/30 rounded-full text-red-500 font-black uppercase tracking-widest text-[10px]">
                        Licencia Inactiva
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">No aparecerá en la tienda</p>
                </div>
            )}

            {/* Header / Price Section */}
            <div className={`relative p-10 text-center border-b border-white/5 ${!isEnabled && 'grayscale opacity-30 shadow-none'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] text-violet-400 border border-violet-500/10 mb-6">
                    <Sparkles size={10} />
                    {name || 'Nueva Licencia'}
                </div>

                <div className="flex items-start justify-center gap-1 group-hover:scale-110 transition-transform duration-700">
                    <span className="text-3xl font-black text-violet-500 mt-3">$</span>
                    <span className="text-8xl font-black tracking-tighter text-white">
                        {wholePart}
                    </span>
                    <span className="text-3xl font-black text-gray-800 mt-3 group-hover:text-violet-500/50 transition-colors">
                        .{fractionalPart}
                    </span>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Pago Único</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Entrega Inmediata</span>
                    </div>
                </div>
            </div>

            {/* Bento Grid Features */}
            <div className={`p-6 ${!isEnabled && 'grayscale opacity-20'}`}>
                <div className="grid grid-cols-2 gap-2 bg-white/[0.02] rounded-[32px] overflow-hidden border border-white/5 p-2">

                    {/* Streams */}
                    <div className="bg-[#0A0A0A] p-6 rounded-[24px] flex flex-col items-center justify-center gap-1.5 group/card hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500 mb-1 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all">
                            <Headphones size={20} />
                        </div>
                        <span className="text-2xl font-black text-white">{formatValue(usage.streams)}</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Streams</span>
                    </div>

                    {/* Sales */}
                    <div className="bg-[#0A0A0A] p-6 rounded-[24px] flex flex-col items-center justify-center gap-1.5 group/card hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 mb-1 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all">
                            <ShoppingCart size={20} />
                        </div>
                        <span className="text-2xl font-black text-white">{formatValue(usage.sales)}</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Ventas</span>
                    </div>

                    {/* Radio */}
                    <div className="bg-[#0A0A0A] p-6 rounded-[24px] flex flex-col items-center justify-center gap-1.5 group/card hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 mb-1 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all">
                            <Radio size={20} />
                        </div>
                        <span className="text-2xl font-black text-white whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 text-center">
                            {usage.radio === 'No Permitido' ? 'No' : usage.radio?.split(' ')[0] || 'Sí'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Radio</span>
                    </div>

                    {/* Files */}
                    <div className="bg-[#0A0A0A] p-6 rounded-[24px] flex flex-col items-center justify-center gap-1.5 group/card hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 mb-1 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all">
                            <Disc size={20} />
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 font-black text-[9px] text-white">
                            {fileList.join(' + ')}
                        </div>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Archivos</span>
                    </div>

                </div>
            </div>

            {/* Footer rights info */}
            <div className={`px-10 py-6 flex items-center justify-between bg-white/[0.01] ${!isEnabled && 'grayscale opacity-10'}`}>
                <div className="flex items-center gap-3">
                    <Globe size={14} className="text-violet-500/50" />
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Explotación Mundial</span>
                </div>
                <Zap size={14} className="text-yellow-500/30" />
            </div>

        </div>
    );
}
