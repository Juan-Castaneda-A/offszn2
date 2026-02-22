import React, { useState, useEffect, useRef } from 'react';
import {
    Rocket, Check, Zap,
    Crown, Star, ShieldCheck,
    ArrowLeft, Loader2, Sparkles,
    Infinity, Layout, BarChart,
    Headphones, Percent, ChevronRight,
    Trophy, Gem, Shield
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

    // Particle Background Effect (Refined)
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
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 1.2,
                opacity: Math.random() * 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-t-2 border-violet-500 rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Consultando Escalafones...</span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden p-6 md:p-12">
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

            <div className="relative z-10 max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">

                {/* --- HERO SECTION --- */}
                <div className="flex flex-col items-center text-center space-y-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 text-gray-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-white/10"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Regresar
                    </button>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl">
                            <Sparkles size={12} className="animate-pulse" /> Estatus de Productor
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            Eleva tu <span className="text-violet-500 not-italic">Legacy</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed opacity-80">
                            Escalabilidad comercial y herramientas de distribución avanzada para productores que dominan la industria.
                        </p>
                    </div>

                    {/* Currency Toggle (Premium) */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-[24px] border border-white/5 backdrop-blur-xl shadow-inner">
                        {Object.values(PRICING).map((p) => (
                            <button
                                key={p.label}
                                onClick={() => changeCurrency(p.label)}
                                className={`px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${currency === p.label ? 'bg-white text-black shadow-2xl scale-[1.05]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- PLANS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch max-w-5xl mx-auto pb-20">

                    {/* Basic Plan */}
                    <PlanCard
                        title="Standard"
                        price="FREE"
                        desc="Para productores emergentes."
                        icon={Shield}
                        features={[
                            { label: "Capacidad: 100 Items", icon: Layout },
                            { label: "Analítica de Tráfico", icon: BarChart },
                            { label: "Protocolo Email", icon: Headphones },
                            { label: "Comisión: 5%", icon: Percent }
                        ]}
                        active={currentPlan === 'basic'}
                        isBasic
                    />

                    {/* Pro Plan */}
                    <div className="relative group">
                        {/* High-End Glow Overlay */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-[52px] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-1000 group-hover:duration-300 animate-pulse" />

                        <PlanCard
                            title="Pro Artist"
                            price={`${activePricing.symbol}${activePricing.price}`}
                            subtitle="/ mensual"
                            desc="El estándar de la industria."
                            icon={Trophy}
                            features={[
                                { label: "Capacidad Ilimitada", icon: Infinity, highlight: "text-[#FFD700]" },
                                { label: "Cero Comisiones (100% de Ventas)", icon: Percent, highlight: "text-[#FFD700]" },
                                { label: "Sello Dorado Verificado", icon: Crown },
                                { label: "Indexación Prioritaria", icon: Star },
                                { label: "Dashboard Avanzado V2", icon: Zap },
                                { label: "Soporte VIP Directo", icon: ShieldCheck }
                            ]}
                            active={currentPlan === 'pro'}
                            onUpgrade={() => setIsPaymentModalOpen(true)}
                            isPro
                        />

                        {/* Premium Floating Badge */}
                        <div className="absolute -top-4 -right-4 px-6 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_10px_30px_rgba(255,215,0,0.4)] z-20 -rotate-3 border-4 border-black group-hover:rotate-0 transition-transform duration-500">
                            Recomendado
                        </div>
                    </div>
                </div>

                {/* --- LEGACY TRUST --- */}
                <div className="text-center pb-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800 mb-8">Tecnología de pago segura vía</p>
                    <div className="flex flex-wrap justify-center gap-12 grayscale opacity-20 hover:opacity-50 transition-all duration-700">
                        <span className="text-xl font-black tracking-tighter uppercase italic">PayPal</span>
                        <span className="text-xl font-black tracking-tighter uppercase italic">Stripe</span>
                        <span className="text-xl font-black tracking-tighter uppercase italic">Binance</span>
                    </div>
                </div>

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

function PlanCard({ title, price, subtitle, desc, features, active, onUpgrade, isBasic, isPro, icon: Icon }) {
    return (
        <div className={`relative p-12 rounded-[50px] border transition-all duration-700 overflow-hidden flex flex-col h-full group/card ${active ? 'bg-white/[0.04] border-white/20 shadow-2xl' : 'bg-[#050505]/80 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}>

            {/* Background Icon Watermark */}
            <div className={`absolute -top-10 -right-10 p-4 opacity-5 group-hover/card:scale-125 transition-transform duration-1000 ${isPro ? 'text-violet-500' : 'text-gray-500'}`}>
                <Icon size={240} />
            </div>

            <div className="space-y-10 flex-1 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isPro ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                            <Icon size={14} />
                        </div>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${isPro ? 'text-violet-500' : 'text-gray-500'}`}>
                            {title}
                        </h3>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black uppercase tracking-tighter text-white">{price}</span>
                            {subtitle && <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.2em]">{subtitle}</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{desc}</p>
                    </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-white/5">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-1">
                            <div className={`p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 transition-all group-hover/item:border-white/10 group-hover/item:bg-white/5 ${f.highlight || 'text-gray-600'}`}>
                                <f.icon size={18} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${f.highlight ? f.highlight : 'text-gray-500 group-hover/item:text-gray-300'}`}>
                                {f.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-16 relative z-10">
                {active ? (
                    <div className="w-full py-6 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Estatus Actual
                    </div>
                ) : (
                    <button
                        onClick={onUpgrade}
                        className={`group/btn w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 shadow-2xl flex items-center justify-center gap-3 ${isPro ? 'bg-white text-black hover:bg-violet-500 hover:text-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                    >
                        {isBasic ? 'Plan Activo' : 'Adquirir Legacy'}
                        {isPro && <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                    </button>
                )}
            </div>
        </div>
    );
}
