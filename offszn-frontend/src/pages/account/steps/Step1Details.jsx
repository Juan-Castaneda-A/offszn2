import React, { useState } from 'react';
import { useUploadStore } from '../../../store/uploadStore';
import { X, ImageIcon, Youtube, Info, Mic, Star, Sliders, Music, Video } from 'lucide-react';
import ImageCropper from '../../../components/ImageCropper';
import VideoMiniEditor from '../../../components/VideoMiniEditor';

export default function Step1Details() {
    const {
        title, description, tags, coverImage, productType, youtubeSync, category,
        videoMode, videoFile,
        updateField, addTag, removeTag
    } = useUploadStore();

    const PRESET_CATEGORIES = [
        { id: 'vocal', label: 'Voces', icon: Mic },
        { id: 'template', label: 'Plantilla', icon: Star },
        { id: 'plugin', label: 'Plugin', icon: Sliders },
        { id: 'instrument', label: 'Instrumento', icon: Music },
    ];

    const [tagInput, setTagInput] = useState('');
    const [showCropper, setShowCropper] = useState(false);
    const [showVideoEditor, setShowVideoEditor] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput.trim().replace(/^#/, '');
            if (val && tags.length < 8) {
                addTag(val);
                setTagInput('');
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedDataUrl) => {
        updateField('coverImage', {
            preview: croppedDataUrl,
            url: null,
            file: null
        });
        updateField('processedCover', null);
        setShowCropper(false);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateField('videoFile', file);
            setShowVideoEditor(true);
        }
    };

    const onVideoEditorComplete = ({ file, preview }) => {
        updateField('processedCover', { file, preview });
        updateField('coverImage', { preview, url: null, file: null });
        setShowVideoEditor(false);
    };

    return (
        <div className="w-full">
            {/* Title above step */}
            <div className="flex items-center gap-2 mb-6">
                <i className="bi bi-info-circle text-[20px] text-white"></i>
                <h2 className="text-[20px] font-bold m-0 text-white">Detalles del Beat</h2>
            </div>

            {/* --- CATEGORY SELECTOR (Solo para PRESET) --- */}
            {productType === 'preset' && (
                <div className="mb-8">
                    <label className="block text-sm font-medium text-[#888] mb-2">Categoría del Preset <span className="text-[#ef4444]">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PRESET_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = category === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => updateField('category', cat.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                                    ${isActive
                                            ? 'bg-violet-500/10 border-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                            : 'bg-[#111] border-[#222] text-[#888] hover:border-[#444] hover:bg-[#161616]'}`}
                                >
                                    <Icon size={24} className={isActive ? 'text-[#8b5cf6]' : ''} />
                                    <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] md:gap-8">

                {/* --- IZQUIERDA: PORTADA --- */}
                <div className="mb-6 md:mb-0">
                    <label className="block text-sm font-medium text-[#888] mb-2">Portada <span className="text-[#ef4444]">*</span></label>
                    <div className="relative aspect-square w-full md:w-[200px] md:h-[200px]">
                        <div
                            className={`relative w-full h-full rounded-xl transition-all duration-300 overflow-hidden cursor-pointer group flex items-center justify-center flex-col text-center border-2 border-dashed
                                ${coverImage?.preview ? 'border-transparent bg-transparent' : 'border-[#333] hover:border-[#8b5cf6]/50 bg-white/[0.02]'}`}
                        >
                            {coverImage?.preview ? (
                                <>
                                    <img src={coverImage.preview} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="bi bi-camera text-2xl text-white"></i>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 flex flex-col items-center justify-center h-full">
                                    <i className="bi bi-image text-3xl text-[#555] mb-2 group-hover:text-[#8b5cf6] transition-colors"></i>
                                    <span className="text-[13px] text-[#888] font-medium leading-[1.3] group-hover:text-white transition-colors">Upload<br />Image</span>
                                    <small className="text-[#555] text-[10px] mt-2">1:1 Square</small>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* YouTube Sync Options (If active) */}
                    {productType === 'beat' && youtubeSync && (
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-[#888] mb-2">YouTube Visualizer</label>

                            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                                {/* Option 1: Static Image + Audio */}
                                <label className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-[#222] ${!videoMode ? 'bg-[#1a1a1a]' : 'hover:bg-[#161616]'}`}>
                                    <input
                                        type="radio"
                                        name="ytMode"
                                        checked={!videoMode}
                                        onChange={() => updateField('videoMode', false)}
                                        className="mt-1 accent-[#8b5cf6]"
                                    />
                                    <div>
                                        <span className={`block text-sm font-medium ${!videoMode ? 'text-white' : 'text-[#888]'}`}>Imagen + Audio</span>
                                        <span className="block text-xs text-[#666] mt-0.5">Se genera un video 1080p c/ la portada</span>
                                    </div>
                                </label>

                                {/* Option 2: Custom Video */}
                                <label className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${videoMode ? 'bg-[#1a1a1a]' : 'hover:bg-[#161616]'}`}>
                                    <input
                                        type="radio"
                                        name="ytMode"
                                        checked={videoMode}
                                        onChange={() => updateField('videoMode', true)}
                                        className="mt-1 accent-[#8b5cf6]"
                                    />
                                    <div>
                                        <span className={`block text-sm font-medium ${videoMode ? 'text-white' : 'text-[#888]'}`}>Video Personalizado</span>
                                        <span className="block text-xs text-[#666] mt-0.5">Sube un loop visual (MP4/MOV)</span>
                                    </div>
                                </label>
                            </div>

                            {/* Custom Video Uploader */}
                            {videoMode && (
                                <div className="mt-3 relative w-full h-[60px]">
                                    <div className="w-full h-full border border-dashed border-[#333] hover:border-[#8b5cf6]/50 rounded-lg bg-white/[0.02] flex items-center justify-center cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-2">
                                            <i className="bi bi-film text-[#555] group-hover:text-[#8b5cf6] transition-colors"></i>
                                            <span className="text-xs text-[#888] font-medium group-hover:text-white transition-colors">
                                                {videoFile ? videoFile.name : 'Select Video File'}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleVideoChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- DERECHA: FORMULARIO --- */}
                <div className="flex-1">

                    {/* Título */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-[#888] mb-2">Nombre del Track <span className="text-[#ef4444]">*</span></label>
                        <input
                            type="text"
                            placeholder="Ej: Lunar Echoes"
                            value={title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[15px] text-white placeholder-[#555] focus:outline-none focus:border-[#fff] focus:bg-[#1a1a1a] transition-all"
                            maxLength="60"
                        />
                        <span className="absolute right-0 top-0 text-[12px] text-[#666]">{title.length}/60</span>
                    </div>

                    {/* Etiquetas */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-[#888] mb-2">Etiquetas (3 mínimo) <span className="text-[#ef4444]">*</span></label>
                        <span className={`absolute right-0 top-0 text-[12px] ${tags.length >= 8 ? 'text-[#ef4444]' : 'text-[#666]'}`}>
                            {tags.length}/8
                        </span>

                        <div className={`w-full bg-[#111] border rounded-lg p-[8px_12px] min-h-[48px] flex flex-wrap gap-2 items-center transition-all ${tags.length >= 8 ? 'border-[#ef4444]/30 bg-[#ef4444]/5' : 'border-[#222] focus-within:border-[#fff] focus-within:bg-[#1a1a1a]'}`}>
                            {tags.map((tag) => (
                                <div key={tag} className="flex items-center gap-1.5 bg-[#222] border border-[#333] text-white text-[13px] font-medium px-2.5 py-1 rounded-md">
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="text-[#888] hover:text-[#ef4444] flex items-center justify-center p-0 bg-transparent border-none cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            <input
                                type="text"
                                placeholder={tags.length < 8 ? "Escribe y presiona Enter..." : ""}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                disabled={tags.length >= 8}
                                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[#fff] text-[15px] p-0 placeholder-[#555] disabled:opacity-0"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-[#888] mb-2">Descripción (Opcional)</label>
                        <span className="absolute right-0 top-0 text-[12px] text-[#666]">{description.length}/1000</span>
                        <textarea
                            placeholder="Cuéntanos más sobre este track..."
                            rows={4}
                            value={description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[15px] text-white placeholder-[#555] focus:outline-none focus:border-[#fff] focus:bg-[#1a1a1a] transition-all resize-none min-h-[120px] max-h-[120px] overflow-y-auto leading-[1.5]"
                        />
                    </div>

                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && (
                <ImageCropper
                    image={tempImage}
                    onCrop={onCropComplete}
                    onCancel={() => setShowCropper(false)}
                />
            )}
            {/* Video Editor Modal */}
            {showVideoEditor && videoFile && (
                <VideoMiniEditor
                    videoFile={videoFile}
                    onComplete={onVideoEditorComplete}
                    onCancel={() => setShowVideoEditor(false)}
                />
            )}
        </div>
    );
}
