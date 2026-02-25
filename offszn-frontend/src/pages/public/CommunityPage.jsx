import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, UserPlus, Calendar, PlayCircle, ArrowLeft, Rocket } from 'lucide-react';

const COMMUNITY_DATA = {
    '/productores': {
        title: 'Comunidad de Productores',
        description: 'Estamos conectando a los mejores productores de la escena. Pronto podrás descubrir perfiles, portafolios y colaborar con otros artistas.',
        icon: Users,
        gradient: 'from-violet-600/20 to-fuchsia-600/20'
    },
    '/collabs': {
        title: 'Colaboraciones Soon',
        description: 'El espacio perfecto para encontrar tu próximo socio musical está en desarrollo. Prepárate para crear en equipo.',
        icon: UserPlus,
        gradient: 'from-blue-600/20 to-violet-600/20'
    },
    '/eventos': {
        title: 'Próximos Eventos',
        description: 'Talleres, campamentos de composición y eventos exclusivos de la comunidad. Mantente atento a las fechas.',
        icon: Calendar,
        gradient: 'from-emerald-600/20 to-teal-600/20'
    },
    '/feed': {
        title: 'Tu Feed Social',
        description: 'Pronto podrás ver qué están creando tus productores favoritos en tiempo real.',
        icon: PlayCircle,
        gradient: 'from-orange-600/20 to-red-600/20'
    }
};

const CommunityPage = () => {
    const location = useLocation();
    const data = COMMUNITY_DATA[location.pathname] || {
        title: 'Próximamente',
        description: 'Esta sección está bajo construcción. Vuelve pronto para descubrir nuevas funciones.',
        icon: Rocket,
        gradient: 'from-zinc-600/20 to-zinc-900/20'
    };

    const Icon = data.icon;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden bg-black">
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-linear-to-br ${data.gradient} blur-[120px] opacity-50`} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* Decorative Element */}
                <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative group">
                    <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-white/10 transition-colors rounded-full" />
                    <Icon className="w-10 h-10 text-white relative z-10 animate-float" />
                </div>

                {/* Content */}
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 md:p-16 shadow-2xl">
                    <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-500 text-[10px] font-black tracking-[.3em] uppercase">
                        Work in Progress
                    </span>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
                        {data.title}
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed mb-10 text-pretty">
                        {data.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/explorar"
                            className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-violet-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 group"
                        >
                            Explorar Marketplace <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to={-1}
                            className="px-8 py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Link>
                    </div>
                </div>

                {/* Status indicator */}
                <div className="mt-12 flex items-center justify-center gap-3 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    Desbloqueando nuevas posibilidades
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
