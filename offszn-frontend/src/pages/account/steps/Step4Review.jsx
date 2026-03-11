import React, { useEffect } from 'react';
import { useUploadStore } from '../../../store/uploadStore';
import { Info, Check, X, ShieldCheck, FileText, FileAudio, Youtube, Users, AlertCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../../store/authStore';

export default function Step4Review() {
    const { profile } = useAuth();
    const {
        title, description, tags, coverImage,
        files, bpm, musicalKey, visibility, date,
        basePrice, promoPrice, isFree, collaborators, productType,
        youtubeSync, category, setStep
    } = useUploadStore();

    const isBeat = productType === 'beat';

    // Verification Items Builder
    const renderVerificationItem = (label, value, isMissing = false, icon = null, stepIndex = 1) => {
        if (isMissing) {
            return (
                <div onClick={() => setStep(stepIndex)} className="verification-item-missing cursor-pointer transition-transform hover:scale-[1.02]" style={{ padding: '10px 12px', borderRadius: '8px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)' }}>
                    <div className="verification-item-icon" style={{ color: '#EF4444' }}>
                        <X size={16} />
                    </div>
                    <div className="verification-item-text" style={{ flex: 1, fontSize: '14px', color: '#EF4444' }}>{label}</div>
                    <div className="verification-item-value" style={{ fontWeight: 600, color: '#EF4444', fontSize: '14px' }}>Falta</div>
                </div>
            );
        }

        return (
            <div onClick={() => setStep(stepIndex)} className="verification-item cursor-pointer transition-transform hover:scale-[1.02]" style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', marginBottom: '12px',
                background: value === 'OK' || value === 'Activado' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: value === 'OK' || value === 'Activado' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: value === 'OK' || value === 'Activado' ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none'
            }}>
                <div className="verification-item-icon" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {icon || (value === 'OK' || value === 'Activado' ? <Check size={16} color="#10b981" /> : <Check size={16} color="#00ff88" />)}
                </div>
                <div className="verification-item-text" style={{ flex: 1, fontSize: '14px', color: '#ddd' }}>{label}</div>
                <div className="verification-item-value" style={{ fontWeight: 600, color: value === 'OK' || value === 'Activado' ? '#10b981' : '#fff', fontSize: '15px' }}>
                    {value}
                </div>
            </div>
        );
    };

    return (
        <div className="form-step active animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="section-title text-[20px] font-bold mb-6 flex items-center gap-2.5">
                Vista Previa del Beat
            </h3>

            <div className="preview-layout grid gap-8 max-w-[1200px]" style={{ gridTemplateColumns: 'minmax(300px, 400px) 1fr' }}>

                {/* --- MARKETPLACE CARD PREVIEW --- */}
                <div className="marketplace-card-preview relative self-start">
                    <h4 className="mb-4 text-[14px] text-[#888]">Cómo se verá en el marketplace</h4>

                    <div className="drumkit-card bg-[#141414]/80 rounded-xl overflow-hidden border border-white/5 backdrop-blur-md transition-all duration-300">
                        <div className="card-cover w-full aspect-square bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                            {coverImage?.preview ? (
                                <>
                                    <img src={coverImage.preview} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 pointer-events-none"></div>
                                </>
                            ) : (
                                <span className="text-[#666] text-sm font-medium">Sin portada</span>
                            )}

                            {/* Card Badges Over Cover */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div>
                                    {isFree ? (
                                        <div className="card-price text-[#00ff88] text-lg font-bold drop-shadow-md">FREE</div>
                                    ) : (
                                        <div className="card-price text-white text-lg font-bold drop-shadow-md">
                                            {promoPrice && promoPrice < basePrice ? (
                                                <>
                                                    <span className="old-price line-through text-white/50 text-[13px] mr-2 font-medium">${basePrice}</span>
                                                    ${promoPrice}
                                                </>
                                            ) : (
                                                <>${basePrice || '0.00'}</>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 hover:scale-105 transition-all shadow-lg">
                                    <i className="bi bi-play-fill text-xl ml-1"></i>
                                </button>
                            </div>
                        </div>

                        <div className="card-content p-4 bg-[#0a0a0a]/60">
                            <h3 className="text-base font-semibold mb-2 leading-tight line-clamp-2 break-words text-white/90">
                                {title || 'Sin título'}
                            </h3>

                            <div className="card-tags flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
                                {tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="bg-white/5 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-[0.5px] text-white/60 border border-white/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="card-producer text-[13px] text-[#888] flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#222] inline-block"></span>
                                Tú (Productor)
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- VERIFICATION PANEL --- */}
                <div className="verification-panel bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]">
                    <h4 className="mb-6 text-[18px] font-bold text-white">Verificar Información</h4>

                    {/* section: Files */}
                    <div className="verification-section mb-6 pb-6 border-b border-white/5">
                        <div className="verification-label text-[11px] font-bold text-[#888] mb-3 uppercase tracking-widest">Archivos</div>
                        <div className="verification-items">
                            {isBeat ? (
                                <>
                                    {renderVerificationItem('Audio Principal (MP3)', files?.mp3_tagged ? 'OK' : null, !files?.mp3_tagged, <FileAudio size={16} color={files?.mp3_tagged ? "#10b981" : "#EF4444"} />, 2)}
                                    {renderVerificationItem('Audio WAV (Sin Tags)', files?.wav_untagged ? 'OK' : null, !files?.wav_untagged, <FileAudio size={16} color={files?.wav_untagged ? "#10b981" : "#EF4444"} />, 2)}
                                    {files?.stems && renderVerificationItem('Stems / Trackouts', 'Trackouts listos', false, <FileText size={16} color="#10b981" />, 2)}
                                </>
                            ) : (
                                renderVerificationItem('Archivo Principal (ZIP)', files?.zip_file ? 'OK' : null, !files?.zip_file, <FileText size={16} color={files?.zip_file ? "#10b981" : "#EF4444"} />, 2)
                            )}
                            {renderVerificationItem('Portada Analizada', coverImage ? 'OK' : null, !coverImage, null, 1)}
                        </div>
                    </div>

                    {/* section: Details */}
                    <div className="verification-section mb-6 pb-6 border-b border-white/5">
                        <div className="verification-label text-[11px] font-bold text-[#888] mb-3 uppercase tracking-widest">Detalles</div>
                        <div className="verification-items">
                            {renderVerificationItem('Título validado', title ? title : null, !title, null, 1)}
                            {isBeat && renderVerificationItem('Datos Musicales', (bpm && musicalKey) ? `${bpm} BPM • ${musicalKey}` : null, !(bpm && musicalKey), null, 2)}
                            {renderVerificationItem('Visibilidad & Fecha', `${visibility === 'public' ? 'Público' : 'Privado'} - ${date || 'Inmediato'}`, false, null, 1)}
                            {renderVerificationItem('Precio de Venta', basePrice ? `$${basePrice}` : 'Free Download', (!basePrice && !isFree), <DollarSign size={16} color={basePrice || isFree ? "#10b981" : "#EF4444"} />, 3)}
                            {youtubeSync && (
                                <div onClick={() => setStep(0)} className="verification-item cursor-pointer transition-transform hover:scale-[1.02]" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)' }}>
                                    <div className="verification-item-icon" style={{ color: '#ef4444' }}><Youtube size={16} /></div>
                                    <div className="verification-item-text" style={{ flex: 1, fontSize: '14px', color: '#ffeaeb' }}>Sincronización YouTube</div>
                                    <div className="verification-item-value" style={{ fontWeight: 600, color: '#ef4444', fontSize: '14px' }}>Activado</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section: Collabs */}
                    <div className="verification-section mb-6 pb-6 border-b border-white/5">
                        <div className="verification-label text-[11px] font-bold text-[#888] mb-3 uppercase tracking-widest">Colaboradores</div>
                        <div className="verification-items">
                            {/* Uploader */}
                            <div onClick={() => setStep(3)} className="verification-item cursor-pointer transition-transform hover:scale-[1.02]" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', marginBottom: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 0 10px rgba(139, 92, 246, 0.1)' }}>
                                <div className="verification-item-icon" style={{ color: '#8b5cf6' }}><Users size={16} /></div>
                                <div className="verification-item-text" style={{ flex: 1, fontSize: '14px', color: '#e0f2fe' }}>Split de Royalties</div>
                                <div className="verification-item-value" style={{ fontWeight: 600, color: '#8b5cf6', fontSize: '14px' }}>{Math.max(0, 100 - collaborators.reduce((acc, c) => acc + Number(c.split || 0), 0))}% para {profile?.nickname || 'Tú (Productor)'}</div>
                            </div>
                            {/* Rest of Collborators */}
                            {collaborators.map((c, idx) => (
                                <div key={idx} onClick={() => setStep(3)} className="verification-item cursor-pointer transition-transform hover:scale-[1.02]" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', marginBottom: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}>
                                    <div className="verification-item-icon" style={{ color: '#3b82f6' }}><Users size={16} /></div>
                                    <div className="verification-item-text" style={{ flex: 1, fontSize: '14px', color: '#e0f2fe' }}>Split de Royalties</div>
                                    <div className="verification-item-value" style={{ fontWeight: 600, color: '#3b82f6', fontSize: '14px' }}>{c.split}% para {c.nickname}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Promotion hint */}
                    <div className="mt-5 text-center p-4 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center">
                        <span className="text-[13px] text-[#aaa] flex items-center gap-2">
                            <AlertCircle size={14} className="text-[#8b5cf6]" /> ¿Quieres agregar una promoción (Ej: 2x1) a tus Beats?
                        </span>
                        <a href="/cuenta/preferencias" target="_blank" className="mt-2 text-[#fff] text-[13px] font-semibold underline underline-offset-4 hover:text-[#ccc] transition-colors">
                            Ver Ofertas Activas
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

