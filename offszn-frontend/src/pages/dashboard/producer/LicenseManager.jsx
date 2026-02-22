import React, { useState } from 'react';
import {
    FileText, Save, RotateCcw, Info,
    ArrowLeft, ShieldCheck, Tag, DollarSign,
    CheckCircle2, AlertCircle, Loader2,
    Settings2, Sparkles, ChevronRight,
    Lock, Unlock, Zap, Globe,
    Music, Radio, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLicenseSettings, LICENSE_TIERS } from '../../../hooks/useLicenseSettings';
import LicensePreviewCard from '../../../components/dashboard/LicensePreviewCard';

const STREAM_OPTIONS = ['5000', '10000', '50000', '100000', '500000', '1000000', 'UNLIMITED'];
const SALES_OPTIONS = ['500', '2000', '5000', '10000', 'UNLIMITED'];
const RADIO_OPTIONS = ['No Permitido', '2 Estaciones', 'ILIMITADO'];

export default function LicenseManager() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('basic');
    const {
        settings, loading, saving,
        updateTier, resetTier, saveSettings
    } = useLicenseSettings();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-t-2 border-violet-500 rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
                    <ShieldCheck className="absolute inset-0 m-auto text-violet-500 animate-pulse" size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Sincronizando Protocolos...</span>
            </div>
        );
    }

    const currentTier = settings[activeTab];
    const isUnlimited = activeTab === 'unlimited';

    const handleReset = () => {
        if (window.confirm('¿Restablecer los valores por defecto para esta licencia?')) {
            resetTier(activeTab);
        }
    };

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
                            <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Legal Ops</span>
                        </div>
                        <div className="h-px w-8 bg-white/5"></div>
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
                        Rights <span className="text-violet-500">Manager</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-violet-500" /> Control técnico de propiedad intelectual y contratos de explotación
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="group flex items-center gap-4 px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                        {saving ? 'Procesando...' : 'Publicar Términos'}
                    </button>
                </div>
            </div>

            {/* --- TIER SELECTION --- */}
            <div className="p-2 bg-[#0A0A0A] border border-white/5 rounded-[32px] flex overflow-x-auto no-scrollbar max-w-fit shadow-inner">
                {LICENSE_TIERS.map(tier => (
                    <button
                        key={tier}
                        onClick={() => setActiveTab(tier)}
                        className={`px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${activeTab === tier
                            ? 'bg-white text-black shadow-2xl scale-[1.02]'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tier}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                {/* --- CONFIGURATION HUB --- */}
                <div className="xl:col-span-2 space-y-10">

                    {/* Status Toggle Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] flex items-center justify-between group shadow-2xl relative overflow-hidden">
                        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-[100px] transition-all duration-1000 ${currentTier.enabled ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`w-5 h-5 rounded-full transition-all duration-700 ${currentTier.enabled ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'}`}></div>
                            <div>
                                <span className="text-sm font-black uppercase tracking-[0.22em] block text-white mb-1">Disponibilidad del Contrato</span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${currentTier.enabled ? 'text-emerald-500' : 'text-gray-600'}`}>
                                    {currentTier.enabled ? 'Activa y sincronizada en el marketplace' : 'Desactivada para nuevos clientes'}
                                </span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer relative z-10">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={currentTier.enabled}
                                onChange={(e) => updateTier(activeTab, { enabled: e.target.checked })}
                            />
                            <div className="w-16 h-9 bg-white/5 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-violet-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                        {/* Commercial Value */}
                        <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] space-y-10 relative overflow-hidden group shadow-2xl">
                            <Tag className="absolute -top-10 -right-10 p-4 text-white opacity-[0.02] -rotate-12 group-hover:scale-125 transition-all duration-1000 pointer-events-none" size={200} />

                            <h3 className="text-white font-black uppercase tracking-tighter text-2xl flex items-center gap-4 relative z-10">
                                <DollarSign size={24} className="text-violet-500" /> Valoración
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Nombre Público</label>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            className="w-full bg-black border border-white/5 rounded-3xl p-6 text-sm font-black text-white focus:border-violet-500 outline-none transition-all placeholder-gray-800 shadow-inner"
                                            value={currentTier.name}
                                            onChange={(e) => updateTier(activeTab, { name: e.target.value })}
                                            maxLength={20}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] text-gray-800 font-black group-focus-within/input:text-violet-500 transition-colors uppercase tracking-[0.2em]">{currentTier.name.length}/20</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Precio Sugerido (USD)</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within/input:text-violet-500 transition-colors">
                                            <DollarSign size={20} />
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full bg-black border border-white/5 rounded-3xl p-6 pl-14 text-sm font-black text-white focus:border-violet-500 outline-none transition-all shadow-inner"
                                            value={currentTier.price}
                                            onChange={(e) => updateTier(activeTab, { price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deliverables */}
                        <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] space-y-10 relative overflow-hidden group shadow-2xl">
                            <FileText className="absolute -top-10 -right-10 p-4 text-white opacity-[0.02] rotate-12 group-hover:scale-125 transition-all duration-1000 pointer-events-none" size={200} />

                            <h3 className="text-white font-black uppercase tracking-tighter text-2xl flex items-center gap-4 relative z-10">
                                <Settings2 size={24} className="text-violet-500" /> Assets
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="p-6 bg-black border border-emerald-500/10 rounded-3xl flex items-center justify-between opacity-40 cursor-not-allowed group/item shadow-inner">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 shadow-2xl">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Audio MP3</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-emerald-500/40">Core File</span>
                                </div>

                                <DeliverableToggle
                                    label="Formato WAV"
                                    active={currentTier.files.wav}
                                    onClick={() => updateTier(activeTab, { files: { ...currentTier.files, wav: !currentTier.files.wav } })}
                                />

                                <DeliverableToggle
                                    label="Track Stems"
                                    active={currentTier.files.stems}
                                    onClick={() => updateTier(activeTab, { files: { ...currentTier.files, stems: !currentTier.files.stems } })}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Usage Rights Management */}
                    <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] space-y-12 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -bottom-20 -right-20 opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <Globe size={300} />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <h3 className="text-white font-black uppercase tracking-tighter text-2xl flex items-center gap-4">
                                    <Info size={24} className="text-violet-500" /> Explotación Comercial
                                </h3>
                                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-10">Restricciones de alcance legal y monetización</p>
                            </div>
                            {isUnlimited && (
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 bg-violet-500/5 px-6 py-3 rounded-2xl border border-violet-500/10 shadow-2xl">
                                    Protocolo Ilimitado
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                            <UsageSelect
                                label="Streams"
                                icon={Music}
                                description="Spotify, Apple Music"
                                value={currentTier.usage.streams}
                                options={STREAM_OPTIONS}
                                disabled={isUnlimited}
                                onChange={(val) => updateTier(activeTab, { usage: { ...currentTier.usage, streams: val } })}
                            />

                            <UsageSelect
                                label="Sales"
                                icon={Share2}
                                description="Ventas directas"
                                value={currentTier.usage.sales}
                                options={SALES_OPTIONS}
                                disabled={isUnlimited}
                                onChange={(val) => updateTier(activeTab, { usage: { ...currentTier.usage, sales: val } })}
                            />

                            <UsageSelect
                                label="Radio"
                                icon={Radio}
                                description="Broadcasting"
                                value={currentTier.usage.radio}
                                options={RADIO_OPTIONS}
                                disabled={isUnlimited}
                                onChange={(val) => updateTier(activeTab, { usage: { ...currentTier.usage, radio: val } })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-start pt-6">
                        <button
                            onClick={handleReset}
                            className="group flex items-center gap-3 text-gray-800 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full border border-transparent hover:border-white/5 hover:bg-white/[0.02]"
                        >
                            <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                            Restaurar Protocolo Original
                        </button>
                    </div>

                </div>

                {/* --- LIVE PREVIEW --- */}
                <div className="flex flex-col items-center">
                    <div className="sticky top-12 space-y-10 w-full flex flex-col items-center">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-800">
                            <div className="w-16 h-px bg-white/5"></div>
                            VISTA PREVIA
                            <div className="w-16 h-px bg-white/5"></div>
                        </div>

                        <div className="w-full transform transition-all duration-700 hover:scale-[1.03] active:scale-[0.98]">
                            <LicensePreviewCard
                                name={currentTier.name}
                                price={currentTier.price}
                                usage={currentTier.usage}
                                files={currentTier.files}
                                isEnabled={currentTier.enabled}
                            />
                        </div>

                        <div className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 space-y-4 max-w-[340px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                                <Zap className="text-violet-500" size={60} />
                            </div>
                            <p className="text-[10px] text-gray-700 text-center font-black uppercase tracking-widest leading-loose relative z-10">
                                Este es el <span className="text-white">blueprint legal</span> que verán tus clientes. Los contratos se generarán dinámicamente basándose en estos parámetros técnicos.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function DeliverableToggle({ label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`p-6 border rounded-3xl flex items-center justify-between cursor-pointer transition-all group duration-500 shadow-inner ${active
                ? 'bg-black border-violet-500/40 shadow-violet-500/5'
                : 'bg-black/20 border-white/5 text-gray-800 hover:border-white/10 hover:text-gray-600'
                }`}
        >
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${active ? 'bg-violet-500 shadow-violet-500/20 text-white' : 'bg-white/[0.02] text-gray-800'
                    }`}>
                    {active ? <CheckCircle2 size={24} /> : <Unlock size={20} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${active ? 'text-white' : 'text-gray-800 group-hover:text-gray-600'}`}>
                    {label}
                </span>
            </div>
            {active && <Sparkles size={16} className="text-violet-500 animate-pulse" />}
        </div>
    );
}

function UsageSelect({ label, description, icon: Icon, value, options, disabled, onChange }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4 flex items-center gap-2">
                    <Icon size={12} className="text-violet-500/40" /> {label}
                </label>
                <div className="text-[8px] font-bold text-gray-800 uppercase tracking-widest ml-4">{description}</div>
            </div>
            <div className="relative group/sel">
                <select
                    className="w-full bg-black border border-white/5 rounded-[28px] p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group-hover/sel:bg-white/[0.02] group-hover/sel:border-white/10 shadow-inner"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} className="bg-[#0A0A0A] py-10">
                            {opt === 'UNLIMITED' ? 'TOTAL ILIMITADO' :
                                opt === 'No Permitido' ? 'RESTRINGIDO' :
                                    opt.includes('Estaciones') ? opt.toUpperCase() :
                                        parseInt(opt).toLocaleString() + ' UNIDADES'}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800 group-hover/sel:text-violet-500 transition-colors">
                    <ChevronRight size={18} className="rotate-90" />
                </div>
            </div>
        </div>
    );
}
