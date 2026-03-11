import React, { useState } from 'react';
import { useUploadStore } from '../../../store/uploadStore';
import { DollarSign, Users, Trash2, Search, Info, UserPlus, FileText } from 'lucide-react';
import { supabase } from '../../../api/client';
import { useAuth } from '../../../store/authStore';

export default function Step3Pricing() {
    const {
        productType, basePrice, promoPrice, trackoutPrice, unlimitedPrice,
        isFree, collaborators, files,
        updateField, addCollaborator, removeCollaborator, updateCollaboratorSplit
    } = useUploadStore();

    const { profile } = useAuth();
    const isBeat = productType === 'beat';

    React.useEffect(() => {
        if (!profile?.license_settings) return;

        const settings = profile.license_settings;
        if (isBeat) {
            if (!basePrice && settings.basic?.price) updateField('basePrice', settings.basic.price.toString());
            if (!promoPrice && settings.premium?.price) updateField('promoPrice', settings.premium.price.toString());
            if (!trackoutPrice && settings.trackout?.price) updateField('trackoutPrice', settings.trackout.price.toString());
            if (!unlimitedPrice && settings.unlimited?.price) updateField('unlimitedPrice', settings.unlimited.price.toString());
        } else {
            if (!basePrice && settings.basic?.price) updateField('basePrice', settings.basic.price.toString());
        }
    }, [profile?.license_settings, isBeat]); // Only run once when viewing step or data loads

    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const searchUsers = async (val) => {
        setSearch(val);
        if (val.length < 2) { setResults([]); return; }

        setSearching(true);
        const { data } = await supabase
            .from('users')
            .select('id, nickname, avatar_url')
            .ilike('nickname', `%${val}%`)
            .limit(5);

        setResults(data || []);
        setSearching(false);
    };

    return (
        <div className="w-full">
            {/* Title above step */}
            <div className="flex items-center gap-2 mb-6">
                <i className="bi bi-info-circle text-[20px] text-white"></i>
                <h2 className="text-[20px] font-bold m-0 text-white">Licencias y Colaboración</h2>
            </div>

            {/* --- CONFIGURACIÓN DE PRECIOS --- */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <i className="bi bi-currency-dollar text-[18px] text-white"></i>
                        <h3 className="text-lg font-bold text-white m-0">Precios y Licencias</h3>
                        <a href="/dashboard/licenses" target="_blank" rel="noopener noreferrer" className="ml-3 text-[11px] font-bold text-[#888] hover:text-[#8b5cf6] flex items-center gap-1 transition-colors border border-[#333] px-2 py-0.5 rounded-md hover:border-[#8b5cf6]">
                            Administrar <i className="bi bi-box-arrow-up-right text-[9px]"></i>
                        </a>
                    </div>

                    <button
                        onClick={() => updateField('isFree', !isFree)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all text-[11px] font-bold uppercase tracking-widest
                        ${isFree ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#111] border-[#333] text-[#888] hover:border-[#555] hover:text-white'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isFree ? 'bg-[#10b981] animate-pulse' : 'bg-[#555]'}`} />
                        Free Download
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isBeat ? (
                        <>
                            <PriceInput
                                label="Licencia Básica (MP3)"
                                description="Precio para leasing básico sin exclusividad"
                                value={basePrice}
                                onChange={(v) => updateField('basePrice', v)}
                                icon="bi-filetype-mp3"
                            />
                            {files?.wav_untagged && (
                                <PriceInput
                                    label="Licencia Premium (WAV)"
                                    description="Precio para leasing con mayor calidad"
                                    value={promoPrice}
                                    onChange={(v) => updateField('promoPrice', v)}
                                    icon="bi-filetype-wav"
                                />
                            )}
                            {files?.stems && (
                                <PriceInput
                                    label="Licencia Trackout"
                                    description="Precio para leasing con pistas separadas (stems)"
                                    value={trackoutPrice}
                                    onChange={(v) => updateField('trackoutPrice', v)}
                                    icon="bi-file-earmark-zip"
                                />
                            )}
                            {(files?.wav_untagged || files?.stems) && (
                                <PriceInput
                                    label="Licencia Ilimitada"
                                    description="Precio para leasing ilimitado / comercial"
                                    value={unlimitedPrice}
                                    onChange={(v) => updateField('unlimitedPrice', v)}
                                    icon="bi-infinity"
                                />
                            )}
                        </>
                    ) : (
                        <PriceInput
                            label="Precio Estándar"
                            description="Licencia de uso comercial"
                            value={basePrice}
                            onChange={(v) => updateField('basePrice', v)}
                            icon="bi-box-seam"
                        />
                    )}
                </div>
            </div>

            {/* --- COLABORACIONES --- */}
            <div className="pt-8 border-t border-[#222]">
                <div className="flex items-center gap-2 mb-4">
                    <i className="bi bi-people text-[18px] text-white"></i>
                    <h3 className="text-lg font-bold text-white m-0">Colaboradores / Splits</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">

                    {/* Lista de Colaboradores */}
                    <div className="bg-[#111] border border-[#222] rounded-xl p-6 relative min-h-[250px] shadow-lg">
                        {(() => {
                            const totalCollab = collaborators.reduce((acc, c) => acc + Number(c.split || 0), 0);
                            const uploaderSplit = Math.max(0, 100 - totalCollab);

                            return (
                                <div className="space-y-3 pb-16">
                                    {/* Tú (Main Producer) */}
                                    <div className="flex items-center gap-4 bg-[#1a1a1a] border border-[#3b82f6] px-4 py-3 rounded-lg shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] font-bold text-sm shadow-inner">
                                            {profile?.nickname?.[0]?.toUpperCase() || 'P'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-bold text-white mb-0.5 truncate">
                                                {profile?.nickname || 'Tú (Productor)'}
                                                <span className="text-[10px] bg-[#3b82f6] text-white px-2 py-0.5 rounded-full ml-2">Subida</span>
                                            </p>
                                            <p className="text-[11px] text-[#888] m-0">Profit Share Restante</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-[16px] text-white font-bold px-3">{uploaderSplit}%</div>
                                        </div>
                                    </div>

                                    {/* Added Collabs */}
                                    {collaborators.map(c => (
                                        <div key={c.id} className="flex items-center gap-4 bg-[#1a1a1a] border border-[#333] px-4 py-3 rounded-lg group transition-all hover:border-[#555] shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] font-bold text-sm shadow-inner">
                                                {c.nickname[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-bold text-white mb-0.5 truncate">{c.nickname}</p>
                                                <p className="text-[11px] text-[#888] m-0">Profit Share</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={c.split}
                                                        onChange={(e) => updateCollaboratorSplit(c.id, e.target.value)}
                                                        className="w-20 bg-black border border-[#333] rounded-md py-1.5 pl-3 pr-8 text-right text-[14px] text-white font-bold focus:border-[#8b5cf6] outline-none transition-colors"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#666] font-bold">%</span>
                                                </div>
                                                <button
                                                    onClick={() => removeCollaborator(c.id)}
                                                    className="w-8 h-8 rounded-md bg-[#222] hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-[#888] flex items-center justify-center border-none cursor-pointer transition-colors"
                                                    title="Eliminar colaborador"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        <div className="absolute bottom-4 left-6 right-6 flex items-start gap-2 pt-4 border-t border-[#222] opacity-70 bg-[#111]">
                            <i className="bi bi-info-circle text-[#8b5cf6] text-[14px] mt-0.5"></i>
                            <p className="text-[11px] font-medium text-[#888] m-0 leading-[1.4]">
                                El total de splits debe ser 100%. Las colaboraciones requieren que el otro usuario tenga cuenta en OFFSZN.
                            </p>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="bg-[#111] border border-[#222] rounded-xl p-5 shadow-lg">
                        <label className="block text-sm font-medium text-[#888] mb-3">Buscar Usuario</label>
                        <div className="relative">
                            <div className="flex items-center bg-black border border-[#333] rounded-lg focus-within:border-[#8b5cf6] transition-all px-3 h-12">
                                <Search size={18} className="text-[#666]" />
                                <input
                                    type="text"
                                    placeholder="@artista..."
                                    value={search}
                                    onChange={(e) => searchUsers(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white text-[14px] px-3 placeholder-[#555]"
                                />
                                {searching && <div className="w-4 h-4 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />}
                            </div>

                            {/* Dropdown Results */}
                            {results.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden shadow-2xl z-50">
                                    {results.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => {
                                                addCollaborator({ id: r.id, nickname: r.nickname, split: 0 });
                                                setSearch('');
                                                setResults([]);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-[#222] text-left transition-colors border-b border-[#333] last:border-none cursor-pointer"
                                        >
                                            {r.avatar_url ? (
                                                <img src={r.avatar_url} alt={r.nickname} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-[#888] font-bold">
                                                    {r.nickname[0].toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-[13px] font-bold text-white flex-1 truncate">{r.nickname}</span>
                                            <i className="bi bi-plus-circle text-[#8b5cf6] text-[16px]"></i>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}

function PriceInput({ label, description, value, onChange, icon }) {
    return (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 transition-all hover:border-[#333]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="block text-[14px] font-bold text-white mb-1">{label}</span>
                    <span className="block text-[11px] text-[#888] max-w-[90%] leading-[1.3]">{description}</span>
                </div>
                <i className={`bi ${icon} text-[20px] text-[#555]`}></i>
            </div>

            <div className="flex items-center bg-black border border-[#333] rounded-lg focus-within:border-[#8b5cf6] transition-all px-4 h-14 group">
                <span className="text-[16px] font-bold text-[#666] group-focus-within:text-[#8b5cf6] mt-0.5">$</span>
                <input
                    type="number"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[22px] font-black text-white px-3 placeholder:text-[#333]"
                    min="0"
                    step="0.01"
                />
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest bg-[#222] px-2 py-1 rounded">USD</span>
            </div>
        </div>
    );
}
