import React, { useState } from 'react';
import { useUploadStore } from '../../../store/uploadStore';
import { Package, Hash, Zap, Eye, Calendar, Shield, Activity, X } from 'lucide-react';

export default function Step2Files() {
    const {
        productType,
        files, bpm, musicalKey, visibility, date, soundCount,
        updateField, updateFiles
    } = useUploadStore();

    const [activeAudioTab, setActiveAudioTab] = useState('high'); // 'high' o 'low'

    const isBeat = productType === 'beat';
    const isLoop = productType === 'loopkit';
    const isKit = productType === 'drumkit' || productType === 'preset';

    const handleFileChange = (key, file) => {
        if (!file) {
            updateFiles({ [key]: null });
            return;
        }
        updateFiles({ [key]: file });
    };

    const MUSIC_KEYS = [
        'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
        'C Maj', 'C# Maj', 'D Maj', 'D# Maj', 'E Maj', 'F Maj', 'F# Maj', 'G Maj', 'G# Maj', 'A Maj', 'A# Maj', 'B Maj'
    ];

    return (
        <div className="w-full">
            {/* Title above step */}
            <div className="flex items-center gap-2 mb-6">
                <i className="bi bi-info-circle text-[20px] text-white"></i>
                <h2 className="text-[20px] font-bold m-0 text-white">Archivos de Instrumental</h2>
            </div>

            {/* --- ARCHIVOS --- */}
            <div className="mb-8">
                {isKit && (
                    <div className="flex justify-end mb-4">
                        <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-[#222]">
                            <button
                                onClick={() => setActiveAudioTab('high')}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all
                                ${activeAudioTab === 'high' ? 'bg-[#8b5cf6] text-white' : 'text-[#888] hover:text-white'}`}
                            >
                                Alta
                            </button>
                            <button
                                onClick={() => setActiveAudioTab('low')}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all
                                ${activeAudioTab === 'low' ? 'bg-[#8b5cf6] text-white' : 'text-[#888] hover:text-white'}`}
                            >
                                Baja
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isBeat ? (
                        <>
                            <FileDropZone
                                label="MP3 Tagged (Preview)"
                                description="Requerido (Versión con marcas de agua para preescucha gratuita)."
                                file={files.mp3_tagged}
                                accept=".mp3"
                                icon="bi-music-note"
                                onChange={(f) => handleFileChange('mp3_tagged', f)}
                            />
                            <FileDropZone
                                label="WAV Untagged (Master)"
                                description="Requerido para licencias (Producto final sin marcas)."
                                file={files.wav_untagged}
                                accept=".wav"
                                icon="bi-file-earmark-music"
                                onChange={(f) => handleFileChange('wav_untagged', f)}
                            />
                            <FileDropZone
                                label="Trackouts (.ZIP)"
                                description="Requerido para licencias avanzadas (Stems/Pistas separadas)."
                                file={files.stems}
                                accept=".zip,.rar"
                                icon="bi-file-earmark-zip"
                                onChange={(f) => handleFileChange('stems', f)}
                            />
                        </>
                    ) : (
                        <>
                            <FileDropZone
                                label={activeAudioTab === 'high' ? "Audio Preview (Alta)" : "Audio Preview (Baja)"}
                                description="Previsualización de audio para los compradores."
                                file={activeAudioTab === 'high' ? files.mp3_tagged : files.mp3_low}
                                accept=".mp3"
                                icon="bi-music-note"
                                onChange={(f) => handleFileChange(activeAudioTab === 'high' ? 'mp3_tagged' : 'mp3_low', f)}
                            />
                            <FileDropZone
                                label="Contenido Principal (.ZIP)"
                                description={`Sube el ${productType} completo comprimido.`}
                                file={files.zip_file}
                                accept=".zip,.rar"
                                icon="bi-file-earmark-zip"
                                onChange={(f) => handleFileChange('zip_file', f)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* --- METADATOS TÉCNICOS Y DISPONIBILIDAD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-[#222]">

                {/* TECHNICAL METADATA */}
                {(isBeat || isLoop || isKit) && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <i className="bi bi-music-note-list text-[18px] text-white"></i>
                            <h3 className="text-lg font-bold text-white m-0">Datos Técnicos</h3>
                        </div>

                        {isKit && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#888] mb-2">Número de Sonidos / Presets</label>
                                <div className="flex items-center bg-[#111] border border-[#222] rounded-lg focus-within:border-[#fff] transition-all px-4">
                                    <Hash size={16} className="text-[#666]" />
                                    <input
                                        type="number"
                                        placeholder="Ej: 150"
                                        value={soundCount}
                                        onChange={(e) => updateField('soundCount', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-white text-[15px] p-3 placeholder-[#444]"
                                    />
                                </div>
                            </div>
                        )}

                        {(isBeat || isLoop) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#888] mb-2">BPM <span className="text-[#ef4444]">*</span></label>
                                    <div className="flex items-center bg-[#111] border border-[#222] rounded-lg focus-within:border-[#fff] transition-all px-4">
                                        <Hash size={16} className="text-[#666]" />
                                        <input
                                            type="number"
                                            placeholder="140"
                                            value={bpm}
                                            onChange={(e) => updateField('bpm', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-white text-[15px] p-3 placeholder-[#444]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#888] mb-2">Key <span className="text-[#ef4444]">*</span></label>
                                    <div className="flex items-center bg-[#111] border border-[#222] rounded-lg focus-within:border-[#fff] transition-all px-4">
                                        <Zap size={16} className="text-[#666]" />
                                        <select
                                            value={musicalKey}
                                            onChange={(e) => updateField('musicalKey', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-white text-[15px] p-3 cursor-pointer"
                                        >
                                            <option value="" className="bg-[#111]">Seleccionar...</option>
                                            {MUSIC_KEYS.map(k => <option key={k} value={k} className="bg-[#111]">{k}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* AVAILABILITY */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="bi bi-clock-history text-[18px] text-white"></i>
                        <h3 className="text-lg font-bold text-white m-0">Disponibilidad</h3>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#888] mb-2">Visibilidad <span className="text-[#ef4444]">*</span></label>
                        <div className="grid grid-cols-3 gap-2 bg-[#111] p-1.5 rounded-lg border border-[#222]">
                            {[
                                { id: 'public', label: 'Público', icon: <Eye size={14} /> },
                                { id: 'private', label: 'Borrador', icon: <Shield size={14} /> },
                                { id: 'unlisted', label: 'Oculto', icon: <Activity size={14} /> }
                            ].map(v => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => updateField('visibility', v.id)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all 
                                    ${visibility === v.id ? 'bg-[#8b5cf6] text-white' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}
                                >
                                    {v.icon}
                                    <span className="hidden sm:inline">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#888] mb-2">Programar Fecha (Opcional)</label>
                        <div className="flex items-center bg-[#111] border border-[#222] rounded-lg focus-within:border-[#fff] transition-all px-4">
                            <Calendar size={18} className="text-[#666]" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => updateField('date', e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-white text-[15px] p-3 placeholder-[#444] [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function FileDropZone({ label, description, file, onChange, accept, icon }) {
    return (
        <div className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 group overflow-hidden bg-white/[0.02] text-center min-h-[160px]
            ${file ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-[#333] hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5'}`}>

            {file ? (
                <>
                    <div className="w-12 h-12 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                        <i className="bi bi-check-lg text-2xl"></i>
                    </div>
                    <span className="text-[14px] font-bold text-white mb-1 truncate max-w-full px-2" title={file.name}>
                        {file.name}
                    </span>
                    <span className="text-[11px] text-[#aaa]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {label}
                    </span>
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                        <button
                            className="w-8 h-8 rounded-full bg-black/50 border border-[#333] hover:border-[#ef4444] hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
                            title="Remove file"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-3 text-[#555] group-hover:text-[#8b5cf6] transition-colors">
                        <i className={`bi ${icon} text-4xl`}></i>
                    </div>
                    <span className="text-[14px] font-bold text-white mb-2">{label}</span>
                    <span className="text-[#888] text-[11px] max-w-[90%] leading-[1.4] mx-auto opacity-70">
                        {description}
                    </span>
                    <span className="mt-3 text-[11px] font-bold text-[#8b5cf6] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        Select File
                    </span>
                </>
            )}

            <input
                type="file"
                accept={accept}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                onChange={(e) => onChange(e.target.files[0])}
            />
        </div>
    );
}
