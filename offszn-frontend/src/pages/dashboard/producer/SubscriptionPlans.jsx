import React, { useState, useEffect, useRef } from 'react';
import {
    Rocket, Check, Zap,
    Crown, Star, ShieldCheck,
    ArrowLeft, Loader2, Sparkles,
    Infinity, Layout, BarChart,
    Headphones, Percent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../hooks/useSubscription';
import PaymentModal from '../../../components/dashboard/PaymentModal';

const PRICING = {
    USD: { symbol: '$', price: 5, label: 'USD' },
    PEN: { symbol: 'S/', price: 19, label: 'PEN' }
};

export default function SubscriptionPlans() {
    const navigate = useNavigate();
    const { loading, currency, currentPlan, changeCurrency, provisionPro } = useSubscription();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const canvasRef = useRef(null);

    // Particle Background Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const activePricing = PRICING[currency];

    const handleSuccess = async (id, provider) => {
        const success = await provisionPro(id, provider);
        if (success) {
            setIsPaymentModalOpen(false);
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-violet-500" size={40} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Preparando Planes...</span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-violet-500/30 overflow-x-hidden p-6 md:p-12">
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

            <div className="relative z-10 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-1000">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al Dashboard
                    </button>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest">
                            <Rocket size={12} /> Desbloquea tu potencial
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                            Escoge tu <span className="text-violet-500">Plan</span>
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                            Únete a la élite de productores y lleva tu carrera al siguiente nivel con herramientas premium
                        </p>
                    </div>

                    {/* Currency Toggle */}
                    <div className="flex items-center gap-4 p-1 bg-white/5 rounded-full border border-white/10 scale-90 md:scale-100">
                        {Object.values(PRICING).map((p) => (
                            <button
                                key={p.label}
                                onClick={() => changeCurrency(p.label)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${currency === p.label ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-gray-500 hover:text-white'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">

                    {/* Basic Plan */}
                    <PlanCard
                        title="Basic"
                        price="FREE"
                        features={[
                            { label: "Hasta 100 Beats/Kits", icon: Layout },
                            { label: "Analíticas Básicas", icon: BarChart },
                            { label: "Soporte Vía Email", icon: Headphones },
                            { label: "5% Comisión de Venta", icon: Percent }
                        ]}
                        active={currentPlan === 'basic'}
                        isBasic
                    />

                    {/* Pro Plan */}
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                        <PlanCard
                            title="Pro Artist"
                            price={`${activePricing.symbol}${activePricing.price}`}
                            subtitle="/ por mes"
                            features={[
                                { label: "Subidas Ilimitadas", icon: Infinity, highlight: "text-[#FFD700]" },
                                { label: "0% Comisión (100% Para Ti)", icon: Percent, highlight: "text-[#FFD700]" },
                                { label: "Sello Pro en tu Perfil", icon: Crown },
                                { label: "Prioridad en el Feed", icon: Star },
                                { label: "Analíticas Avanzadas", icon: Zap },
                                { label: "Soporte 24/7 VIP", icon: ShieldCheck }
                            ]}
                            active={currentPlan === 'pro'}
                            onUpgrade={() => setIsPaymentModalOpen(true)}
                            isPro
                        />

                        {/* Popular Badge */}
                        <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#FFD700] text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20 rotate-12">
                            MÁS POPULAR
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    currency={currency}
                    price={activePricing.price}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
}

function PlanCard({ title, price, subtitle, features, active, onUpgrade, isBasic, isPro }) {
    return (
        <div className={`relative p-10 md:p-12 rounded-[40px] border transition-all duration-500 overflow-hidden flex flex-col h-full ${active ? 'bg-white/[0.03] border-white/20' : 'bg-black border-white/5 hover:border-white/10'}`}>
            <div className="space-y-8 flex-1">
                <div className="space-y-2">
                    <h3 className={`text-xs font-black uppercase tracking-[0.3em] ${isPro ? 'text-violet-500' : 'text-gray-500'}`}>
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black uppercase tracking-tighter text-white">{price}</span>
                        {subtitle && <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{subtitle}</span>}
                    </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-white/5">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 group/item">
                            <div className={`p-2 rounded-xl bg-white/5 transition-colors group-hover/item:bg-white/10 ${f.highlight || 'text-gray-500'}`}>
                                <f.icon size={16} />
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${f.highlight ? f.highlight : 'text-gray-400'}`}>
                                {f.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-12">
                {active ? (
                    <div className="w-full py-5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Check size={16} /> Tu Plan Actual
                    </div>
                ) : (
                    <button
                        onClick={onUpgrade}
                        className={`w-full py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${isPro ? 'bg-white text-black hover:bg-violet-500 hover:text-white shadow-white/5' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                    >
                        {isBasic ? 'Plan Seleccionado' : 'Mejorar Ahora'}
                    </button>
                )}
            </div>
        </div>
    );
}
