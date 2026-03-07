import React, { useState, useRef, useEffect } from 'react';
import { useUploadStore } from '../store/uploadStore';
import { extractFrame, generateGIF } from '../utils/YouTubeUploader';
import { X, Play, Pause, Scissors, Image as ImageIcon, Zap, Check, Loader2 } from 'lucide-react';

export default function VideoMiniEditor({ videoFile, onComplete, onCancel }) {
    const {
        coverType, gifRange, setYoutubeStatus, setYoutubeProgress, updateField
    } = useUploadStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
    };

    const handleProcess = async () => {
        setIsProcessing(true);
        setYoutubeStatus('rendering');
        try {
            let resultBlob;
            if (coverType === 'image') {
                resultBlob = await extractFrame(videoFile, currentTime);
            } else {
                const [start, end] = gifRange;
                resultBlob = await generateGIF(videoFile, start, end - start, (p) => setYoutubeProgress(p));
            }

            const preview = URL.createObjectURL(resultBlob);
            onComplete({
                file: resultBlob,
                preview: preview
            });
        } catch (error) {
            console.error('Error processing video:', error);
            alert('Error al procesar el video. Inténtalo de nuevo.');
        } finally {
            setIsProcessing(false);
            setYoutubeStatus('idle');
            setYoutubeProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-full">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Mini Editor de Video</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Selecciona el cover para tu beat</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl border border-white/5">
                        <video
                            ref={videoRef}
                            src={previewUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            className="w-full h-full object-contain"
                            onClick={togglePlay}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 scale-90 group-hover:scale-100 transition-transform">
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                            <div
                                className="h-full bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Tipo de Portada</label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <button
                                    onClick={() => updateField('coverType', 'image')}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                    ${coverType === 'image' ? 'bg-violet-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <ImageIcon size={14} />
                                    Imagen Estática
                                </button>
                                <button
                                    onClick={() => updateField('coverType', 'gif')}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                    ${coverType === 'gif' ? 'bg-violet-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Zap size={14} />
                                    Mini Clip (GIF)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {coverType === 'image' ? (
                                <>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Frame Seleccionado</label>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-white font-mono text-sm">{currentTime.toFixed(2)}s</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Tiempo actual</span>
                                        </div>
                                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
                                            <ImageIcon size={20} />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
                                        Busca el momento perfecto en el video y úsalo como portada para tu beat en OFFSZN.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Rango del GIF (3 segs max)</label>
                                        <span className="text-[10px] text-violet-500 font-bold">{(gifRange[1] - gifRange[0]).toFixed(1)}s</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration}
                                                step="0.1"
                                                value={gifRange[0]}
                                                onChange={(e) => {
                                                    const start = parseFloat(e.target.value);
                                                    updateField('gifRange', [start, Math.min(start + 3, duration || 0)]);
                                                    if (videoRef.current) videoRef.current.currentTime = start;
                                                }}
                                                className="w-full accent-violet-600"
                                            />
                                            <span className="text-[10px] text-gray-500 font-mono w-12">{gifRange[0].toFixed(1)}s</span>
                                        </div>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
                                            Selecciona un inicio. El sistema capturará automáticamente los siguientes 3 segundos para crear un GIF animado de alta calidad.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="flex items-center gap-3 bg-white text-black px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-violet-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Confirmar Diseño
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
