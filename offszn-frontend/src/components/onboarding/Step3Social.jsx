import React, { useState } from 'react';
import { Instagram, Youtube, Music2, Twitter, Music } from 'lucide-react';

const Step3Social = ({ onNext, onBack, initialData }) => {
    const [socialLinks, setSocialLinks] = useState(initialData.socialLinks || {});

    const platforms = [
        { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@tuusuario' },
        { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Canal de YouTube' },
        { key: 'soundcloud', label: 'SoundCloud', icon: Music2, placeholder: 'soundcloud.com/tuusuario' },
        { key: 'spotify', label: 'Spotify', icon: Music, placeholder: 'Artista en Spotify' },
        { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: '@tuusuario' }
    ];

    const handleChange = (platform, value) => {
        setSocialLinks({ ...socialLinks, [platform]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext({ socialLinks });
    };

    const handleSkip = () => {
        onNext({ socialLinks: {} });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Conecta tus redes</h1>
                <p className="text-zinc-400">Opcional - Puedes saltar este paso</p>
            </div>

            {/* Social Inputs */}
            <div className="space-y-4">
                {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                        <div key={platform.key}>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                                <Icon className="w-4 h-4" />
                                {platform.label}
                            </label>
                            <input
                                type="text"
                                value={socialLinks[platform.key] || ''}
                                onChange={(e) => handleChange(platform.key, e.target.value)}
                                placeholder={platform.placeholder}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-8 py-3 bg-transparent border border-zinc-800 text-zinc-300 font-semibold rounded-lg hover:border-zinc-600 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
                    >
                        Saltar
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Step3Social;
