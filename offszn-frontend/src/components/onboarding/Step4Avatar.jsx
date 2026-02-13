import React, { useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { supabase } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const Step4Avatar = ({ onNext, onBack, initialData, isSubmitting }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { user } = useAuthStore();

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let avatarUrl = initialData.avatarUrl || '';

        // Upload avatar if one was selected
        if (imageSrc && croppedAreaPixels) {
            setIsUploading(true);
            try {
                const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                const fileName = `${user.id}-${Date.now()}.jpg`;

                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, croppedBlob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatarUrl = publicUrl;
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Error al subir la imagen. Continuaremos sin avatar.');
            } finally {
                setIsUploading(false);
            }
        }

        onNext({ avatarUrl });
    };

    const handleSkip = () => {
        onNext({ avatarUrl: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Sube tu foto</h1>
                <p className="text-zinc-400">Opcional - Ayuda a otros a reconocerte</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
                {!imageSrc ? (
                    <label className="w-40 h-40 rounded-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900">
                        <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                        <span className="text-sm text-zinc-500">Subir imagen</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                ) : (
                    <div className="w-full">
                        <div className="relative w-full h-80 bg-zinc-900 rounded-xl overflow-hidden">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm text-zinc-400 mb-2">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setImageSrc(null)}
                            className="mt-4 text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Cambiar imagen
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting || isUploading}
                    className="px-8 py-3 bg-transparent border border-zinc-800 text-zinc-300 font-semibold rounded-lg hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-50"
                >
                    Atrás
                </button>
                <div className="flex gap-3">
                    {!imageSrc && (
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="px-6 py-3 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Saltar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Completando...' : 'Finalizar'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Step4Avatar;
