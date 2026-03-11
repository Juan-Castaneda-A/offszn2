import React, { useState } from 'react';
import { useUploadStore } from '../../../store/uploadStore';
import logoOffszn from '../../../assets/images/LOGO-OFFSZN.png';
import { BsBoombox, BsInfinity, BsSliders, BsVinyl, BsXLg, BsYoutube } from 'react-icons/bs';

const TYPES = [
    {
        id: 'beat',
        title: 'Beat',
        description: 'Sube tus instrumentales y vendelas con licencias profesionales.',
        icon: BsVinyl,
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.1)',
        badge: 'Popular',
        badgeClass: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black shadow-[0_4px_15px_rgba(255,215,0,0.3)]',
        animDelay: '0.2s'
    },
    {
        id: 'drumkit',
        title: 'Drum Kit',
        description: 'Comparte tus mejores sonidos, one-shots y loops de batería.',
        icon: BsBoombox,
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        badge: null,
        animDelay: '0.3s'
    },
    {
        id: 'preset',
        title: 'Preset Banks',
        description: 'Vende bancos de sonidos para VSTs como Serum, Analog Lab, etc.',
        icon: BsSliders,
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        badge: null,
        animDelay: '0.4s'
    },
    {
        id: 'loopkit',
        title: 'Loop Kit',
        description: 'Sube tus mejores melodías y loops de alta calidad.',
        icon: BsInfinity,
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.1)',
        badge: null,
        animDelay: '0.5s'
    }
];

export default function TypeSelector() {
    const { selectType, setYoutubeSync } = useUploadStore();
    const [selectedType, setSelectedType] = useState(null);
    const [showStrategyModal, setShowStrategyModal] = useState(false);

    const handleSelectType = (typeId) => {
        setSelectedType(typeId);
        setShowStrategyModal(true);
    };

    const handleStrategySelect = (useYt) => {
        setYoutubeSync(useYt); // Enable or disable Youtube Sync
        selectType(selectedType); // Proceed to step 1
    };

    const closeModal = () => {
        setShowStrategyModal(false);
        setSelectedType(null);
    };

    return (
        <div className="relative w-full flex flex-col items-center justify-center font-sans selection:bg-violet-500/30 min-h-[calc(100vh-80px)]">
            <div className="relative z-10 w-full max-w-[800px] px-4">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards" style={{ animationDelay: '0.1s' }}>
                    <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-[48px] font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-[#e0e0e0] bg-clip-text text-transparent leading-tight border-none">
                        ¿Qué quieres subir hoy?
                    </h1>
                    <p className="text-[#888] text-base">Selecciona el tipo de contenido para comenzar.</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleSelectType(type.id)}
                                className="group relative bg-[#111] border border-[#222] p-8 rounded-2xl text-center transition-all duration-200 hover:bg-[#141414] flex flex-col items-center justify-center h-[240px] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
                                style={{
                                    animationDelay: type.animDelay
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = type.id === 'beat' ? '#8B5CF6' : type.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#222';
                                }}
                            >
                                {/* External Icon Overlay Effect (Legacy) */}
                                <div className="absolute top-5 right-5 text-[#666] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sm">
                                    <i className="bi bi-box-arrow-up-right"></i>
                                </div>

                                {/* Badge */}
                                {type.badge && (
                                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${type.badgeClass}`}>
                                        {type.badge}
                                    </span>
                                )}

                                <div
                                    className="w-[70px] h-[70px] rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300"
                                    style={{ backgroundColor: type.bg, color: type.color }}
                                >
                                    <Icon size={32} />
                                </div>

                                <h3 className="font-['Plus_Jakarta_Sans'] text-white text-[22px] font-extrabold tracking-[-0.5px] mb-2">
                                    {type.title}
                                </h3>

                                <p className="text-[#888] text-sm leading-[1.5] max-w-[240px]">
                                    {type.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* UPGRADE MODAL STRATEGY */}
            {showStrategyModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex justify-center items-center opacity-100 transition-opacity">
                    <div className="bg-[#0f0f0f] border border-[#333] rounded-2xl w-[90%] max-w-[900px] p-0 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 transition-transform">

                        <button
                            className="absolute right-5 top-5 z-10 bg-black/50 border border-[#333] rounded-full w-9 h-9 flex items-center justify-center text-white text-xl cursor-pointer transition-all hover:bg-black/80 hover:border-white"
                            onClick={closeModal}
                        >
                            <BsXLg size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* OPTION 1: OFFSZN ONLY */}
                            <div className="p-10 border-b md:border-b-0 md:border-r border-[#222] flex flex-col items-center gap-8">
                                <h4 className="text-white text-[22px] font-extrabold m-0 text-center tracking-[-0.5px]">
                                    Subir a OFFSZN
                                </h4>

                                <div className="w-full aspect-square border border-[#333] bg-[#0a0a0a] rounded-lg flex items-center justify-center overflow-hidden p-5">
                                    <img
                                        src={logoOffszn}
                                        alt="OFFSZN"
                                        className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.2)] m-auto"
                                    />
                                </div>

                                <button
                                    className="w-full p-4 rounded-full bg-white text-black border-none text-base font-bold cursor-pointer transition-all mt-2 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    onClick={() => handleStrategySelect(false)}
                                >
                                    Comenzar
                                </button>
                            </div>

                            {/* OPTION 2: YOUTUBE + OFFSZN */}
                            <div className="p-10 flex flex-col items-center gap-8 relative overflow-hidden">
                                {/* Golden Glow Background */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,transparent_70%)] pointer-events-none"></div>

                                <h4 className="text-white text-[22px] font-extrabold m-0 text-center tracking-[-0.5px] z-10">
                                    Subir a YouTube y OFFSZN
                                </h4>

                                <div className="w-full aspect-square border border-[#333] bg-[#0a0a0a] rounded-lg flex items-center justify-center overflow-hidden p-5 z-10">
                                    <div className="w-[115%] h-[115%] flex flex-col items-center justify-center gap-4 m-auto">
                                        <BsYoutube size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                                        <span className="text-white font-black text-2xl">+</span>
                                        <img src={logoOffszn} alt="OFFSZN" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                                    </div>
                                </div>

                                <button
                                    className="w-full p-4 rounded-full bg-gradient-to-r from-[#FF0000] via-[#FF4500] to-[#FF0000] text-white border-none text-base font-bold cursor-pointer transition-all mt-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] bg-[length:200%_auto] z-10 animate-[pulse_2s_infinite]"
                                    onClick={() => handleStrategySelect(true)}
                                >
                                    Auto-Publish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
