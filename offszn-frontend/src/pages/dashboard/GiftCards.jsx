import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../api/client'; // Ajustado a la ruta correcta
import { useNavigate, Link } from 'react-router-dom';
import {
    FaGift,
    FaTrophy,
    FaSyncAlt,
    FaLock,
    FaWallet,
    FaCheckCircle,
    FaTimes,
    FaRocket,
    FaInfoCircle,
    FaUserLock,
    FaCoins,
    FaPercent,
    FaStore,
    FaBan,
    FaCalendarAlt,
    FaInfinity,
    FaFileContract,
    FaDollarSign,
    FaStar
} from 'react-icons/fa';

// Importa aquí tu CSS o asegúrate de que esté cargado globalmente
// import './GiftCards.css'; 

export default function GiftCards() {
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currency, setCurrency] = useState('USD');
    const [balance, setBalance] = useState(0);
    const [giftCards, setGiftCards] = useState([]);

    // Estados de Lógica de Negocio
    const [hasClaimedWelcome, setHasClaimedWelcome] = useState(false);
    const [lastSpinMonth, setLastSpinMonth] = useState(null);

    // Estados de UI (Ruleta y Modales)
    const [isSpinning, setIsSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [spinMessage, setSpinMessage] = useState({ disabled: false, text: "Girar Ruleta", info: "Disponible ahora" });

    const [activeModal, setActiveModal] = useState(null); // 'welcome', 'prize', 'feature'
    const [prizeWon, setPrizeWon] = useState(null);

    // Referencias constantes
    const EXCHANGE_RATE = 3.8;
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // --- INICIALIZACIÓN ---
    useEffect(() => {
        checkSession();
    }, []);

    // Actualizar controles de la ruleta cuando cambia el estado
    useEffect(() => {
        updateWheelControls();
    }, [hasClaimedWelcome, lastSpinMonth]);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        setUser(session.user);
        fetchStateFromDB(session.user.id);
        setLoading(false);
    };

    // Carga desde Supabase
    const fetchStateFromDB = async (userId) => {
        try {
            // 1. Cargar datos del perfil (balance, flags)
            const { data: profile } = await supabase
                .from('users')
                .select('reward_balance, has_claimed_welcome, last_spin_month')
                .eq('id', userId)
                .single();

            if (profile) {
                setBalance(Number(profile.reward_balance) || 0);
                setHasClaimedWelcome(profile.has_claimed_welcome || false);
                setLastSpinMonth(profile.last_spin_month || null);
            }

            // 2. Cargar Gift Cards
            const { data: cards } = await supabase
                .from('gift_cards')
                .select('*')
                .eq('user_id', userId)
                .eq('is_used', false)
                .order('created_at', { ascending: false });

            if (cards) {
                const formattedCards = cards.map(c => ({
                    id: c.id,
                    type: c.type,
                    value: Number(c.value),
                    description: c.description,
                    isDiscount: c.is_discount,
                    active: !c.is_used,
                    code: c.code
                }));
                setGiftCards(formattedCards);
            }
        } catch (err) {
            console.error("Error loading rewards state:", err);
        }
    };

    const persistAction = async (updates) => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            // 1. Si hay una nueva card, insertarla
            if (updates.newCard) {
                await supabase
                    .from('gift_cards')
                    .insert([{
                        user_id: currentUser.id,
                        type: updates.newCard.type,
                        value: updates.newCard.value,
                        description: updates.newCard.description,
                        is_discount: updates.newCard.isDiscount,
                        code: updates.newCard.code || `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                    }]);
            }

            // 2. Actualizar perfil
            const userUpdates = {};
            if (updates.hasClaimedWelcome !== undefined) userUpdates.has_claimed_welcome = updates.hasClaimedWelcome;
            if (updates.balance !== undefined) userUpdates.reward_balance = updates.balance;
            if (updates.lastSpinMonth !== undefined) userUpdates.last_spin_month = updates.lastSpinMonth;

            if (Object.keys(userUpdates).length > 0) {
                await supabase
                    .from('users')
                    .update(userUpdates)
                    .eq('id', currentUser.id);
            }
        } catch (err) {
            console.error("Error persisting reward action:", err);
        }
    };

    // --- LÓGICA DE NEGOCIO ---

    const formatAmount = (usdValue) => {
        if (currency === 'USD') return `$${usdValue.toFixed(2)} USD`;
        return `S/${(usdValue * EXCHANGE_RATE).toFixed(2)} PEN`;
    };

    const hasSpunThisMonth = () => {
        const today = new Date();
        const currentKey = `${today.getFullYear()}-${today.getMonth()}`;
        return lastSpinMonth === currentKey;
    };

    const updateWheelControls = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextMonthName = MONTH_NAMES[nextMonthIndex];

        if (!hasClaimedWelcome) {
            setSpinMessage({
                disabled: true,
                text: "Bloqueado",
                info: "Reclama tu regalo de bienvenida primero"
            });
        } else if (hasSpunThisMonth()) {
            setSpinMessage({
                disabled: true,
                text: "Ya Giraste Este Mes",
                info: `Próxima ruleta: 1 de ${nextMonthName}`
            });
        } else {
            setSpinMessage({
                disabled: false,
                text: "Girar Ruleta",
                info: "¡Gira y gana!"
            });
        }
    };

    // 1. Reclamar Bienvenida
    const handleClaimWelcome = () => {
        if (hasClaimedWelcome) return;

        const newCard = {
            id: Date.now(),
            type: 'Bienvenida',
            value: 5,
            description: 'Gift card de bienvenida.',
            isDiscount: false,
            active: true
        };

        const newCards = [...giftCards, newCard];
        const newBalance = balance + 5;

        setHasClaimedWelcome(true);
        setGiftCards(newCards);
        setBalance(newBalance);
        setActiveModal('welcome');

        persistAction({
            hasClaimedWelcome: true,
            balance: newBalance,
            newCard: newCard
        });
    };

    // 2. Girar Ruleta
    const handleSpinWheel = () => {
        if (isSpinning || spinMessage.disabled) return;

        setIsSpinning(true);

        // Definir premios
        const prizes = [
            { text: '$1 USD', value: 1, type: 'money', isDiscount: false, desc: 'Premio mensual.', start: 0, end: 90 },
            { text: '10% OFF', value: 10, type: 'discount', isDiscount: true, desc: 'Descuento único.', start: 90, end: 180 },
            { text: '15% OFF', value: 15, type: 'discount', isDiscount: true, desc: 'Descuento único.', start: 180, end: 270 },
            { text: '20% OFF', value: 20, type: 'discount', isDiscount: true, desc: 'Descuento único.', start: 270, end: 360 }
        ];

        // Selección aleatoria
        const randomIndex = Math.floor(Math.random() * prizes.length);
        const selectedPrize = prizes[randomIndex];

        // Cálculo de rotación física
        const baseRotation = 3600; // 10 vueltas completas
        const segmentCenter = (selectedPrize.start + selectedPrize.end) / 2;
        const randomOffset = (Math.random() * 40) - 20; // Variación natural
        const targetRotation = 360 - segmentCenter + randomOffset;

        setWheelRotation(baseRotation + targetRotation);

        // Esperar a que termine la animación (5s en CSS)
        setTimeout(() => {
            const today = new Date();
            const currentKey = `${today.getFullYear()}-${today.getMonth()}`;

            const newCard = {
                id: Date.now(),
                type: selectedPrize.text, // Etiqueta
                value: selectedPrize.value,
                description: selectedPrize.desc,
                isDiscount: selectedPrize.isDiscount,
                active: true
            };

            const newCards = [...giftCards, newCard];
            // Solo sumamos al balance si es dinero, no descuento
            const newBalance = selectedPrize.isDiscount ? balance : balance + selectedPrize.value;

            setLastSpinMonth(currentKey);
            setGiftCards(newCards);
            setBalance(newBalance);
            setIsSpinning(false);
            setPrizeWon(selectedPrize);
            setActiveModal('prize');

            persistAction({
                lastSpinMonth: currentKey,
                balance: newBalance,
                newCard: newCard
            });

        }, 5000);
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>;

    return (
        <div className="w-full min-h-screen bg-black text-[#e5e5e5] font-['Inter'] relative pb-20">

            {/* Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_70%)]"></div>

            <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-[#666] mb-6">
                        <Link to="/dashboard" className="hover:text-purple-500 transition-colors">Dashboard</Link>
                        <span><i className="fas fa-chevron-right text-xs"></i></span>
                        <span className="text-white font-semibold">Gift Cards</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Gift Cards OFFSZN</h1>
                    <p className="text-[#666] text-lg">Recompensas exclusivas. Acumula saldo y descuentos.</p>
                </div>

                {/* CURRENCY TOGGLE */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setCurrency('USD')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border font-semibold text-sm transition-all ${currency === 'USD' ? 'bg-[rgba(139,92,246,0.15)] border-purple-500 text-white' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#999] hover:text-white'}`}
                    >
                        <FaDollarSign /> USD
                    </button>
                    <button
                        onClick={() => setCurrency('PEN')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border font-semibold text-sm transition-all ${currency === 'PEN' ? 'bg-[rgba(139,92,246,0.15)] border-purple-500 text-white' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#999] hover:text-white'}`}
                    >
                        <FaCoins /> PEN
                    </button>
                </div>

                {/* WELCOME GIFT */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-[rgba(139,92,246,0.3)] bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(99,102,241,0.15)] p-8 text-center mb-8">
                    <div className="relative z-10 flex flex-col items-center">
                        <FaGift className="text-5xl text-purple-500 mb-4" />
                        <h2 className="text-2xl font-extrabold text-white mb-2">¡Bienvenido a OFFSZN!</h2>
                        <div className="text-4xl font-extrabold text-purple-400 mb-3">{formatAmount(5)}</div>
                        <p className="text-[#999] mb-6 max-w-lg mx-auto">
                            Como regalo de bienvenida, te obsequiamos <strong>$5 USD</strong> para que puedas usarlos en cualquier producto de nuestra tienda.
                        </p>
                        <button
                            onClick={handleClaimWelcome}
                            disabled={hasClaimedWelcome}
                            className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ${hasClaimedWelcome ? 'bg-[rgba(34,197,94,0.2)] text-green-400 cursor-default' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:-translate-y-1'}`}
                        >
                            {hasClaimedWelcome ? <><FaCheckCircle /> Regalo Reclamado</> : <><FaStar /> Reclamar Mi Regalo</>}
                        </button>
                    </div>
                    {/* Animated Pulse Background Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)] animate-pulse pointer-events-none"></div>
                </div>

                {/* WHEEL SECTION */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 mb-8 text-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center justify-center gap-3">
                            <FaTrophy className="text-yellow-500" /> Ruleta Mensual
                        </h2>
                        <p className="text-[#666]">¡Gira la ruleta una vez al mes y gana increíbles recompensas!</p>
                    </div>

                    {/* WHEEL UI */}
                    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto mb-8">
                        {/* Pointer */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-red-500 z-20"></div>

                        {/* Rotating Wheel */}
                        <div
                            className="w-full h-full rounded-full border-[6px] border-[rgba(255,255,255,0.1)] relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.17,0.67,0.12,0.99)"
                            style={{
                                transform: `rotate(${wheelRotation}deg)`,
                                background: 'conic-gradient(from 0deg, #8b5cf6 0deg 90deg, #6366f1 90deg 180deg, #ec4899 180deg 270deg, #f59e0b 270deg 360deg)'
                            }}
                        >
                            {/* Labels */}
                            <div className="absolute inset-0 pointer-events-none text-white font-bold text-lg md:text-xl drop-shadow-md">
                                <div className="absolute inset-0 flex items-center justify-center rotate-45"><span className="-translate-y-24 md:-translate-y-32">$1 USD</span></div>
                                <div className="absolute inset-0 flex items-center justify-center rotate-[135deg]"><span className="-translate-y-24 md:-translate-y-32">10% OFF</span></div>
                                <div className="absolute inset-0 flex items-center justify-center rotate-[225deg]"><span className="-translate-y-24 md:-translate-y-32">15% OFF</span></div>
                                <div className="absolute inset-0 flex items-center justify-center rotate-[315deg]"><span className="-translate-y-24 md:-translate-y-32">20% OFF</span></div>
                            </div>

                            {/* Center Point */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full border-4 border-[#0a0a0a] z-10 flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                                <FaStar />
                            </div>
                        </div>
                    </div>

                    {/* Spin Controls */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleSpinWheel}
                            disabled={spinMessage.disabled || isSpinning}
                            className={`px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${spinMessage.disabled || isSpinning
                                ? 'bg-[rgba(255,255,255,0.1)] text-[#666] cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:-translate-y-1'
                                }`}
                        >
                            {isSpinning ? <FaSyncAlt className="animate-spin" /> : (spinMessage.disabled ? <FaCheckCircle /> : <FaSyncAlt />)}
                            {isSpinning ? 'Girando...' : spinMessage.text}
                        </button>
                        <div className="px-5 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2">
                            {spinMessage.disabled ? <FaLock /> : <FaCalendarAlt />}
                            {spinMessage.info}
                        </div>
                    </div>
                </div>

                {/* CARDS GRID */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[rgba(255,255,255,0.08)] pb-4 gap-4">
                        <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                            <FaWallet className="text-purple-500" /> Mis Gift Cards
                        </h2>
                        <div className="flex items-center gap-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] px-5 py-2 rounded-xl">
                            <span className="text-xs font-bold text-purple-400 uppercase">Balance Total:</span>
                            <span className="text-xl font-extrabold text-white">{formatAmount(balance)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {giftCards.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-[#666]">
                                <FaGift className="text-5xl mb-4 mx-auto opacity-50" />
                                <h3 className="text-lg font-medium text-[#999]">No tienes gift cards activas</h3>
                                <p className="text-sm">Gira la ruleta o reclama tu regalo de bienvenida.</p>
                            </div>
                        ) : (
                            giftCards.map((card) => (
                                <div key={card.id} className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:-translate-y-1 ${card.isDiscount ? 'bg-[rgba(236,72,153,0.05)] border-[rgba(236,72,153,0.2)]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:border-purple-500/30'}`}>
                                    <div className={`absolute top-0 left-0 right-0 h-1 ${card.isDiscount ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}></div>

                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase mb-3 ${card.isDiscount ? 'bg-[rgba(236,72,153,0.2)] text-pink-500' : 'bg-[rgba(139,92,246,0.2)] text-purple-500'}`}>
                                        {card.isDiscount ? <FaPercent /> : <FaGift />} {card.type}
                                    </div>

                                    <div className="text-3xl font-extrabold text-white mb-2">
                                        {card.isDiscount ? `${card.value}% OFF` : formatAmount(card.value)}
                                    </div>
                                    <div className="text-sm text-[#888] mb-4 h-10 line-clamp-2">{card.description}</div>

                                    <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                                        <FaCheckCircle /> {card.isDiscount ? 'Disponible' : 'Activa'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RULES SECTION (Static for SEO/Info) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-[rgba(139,92,246,0.05)] border border-dashed border-[rgba(139,92,246,0.3)] rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 text-center">¿Cómo usarlas?</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <Step number="1" title="Explora" desc="Busca tu producto ideal." />
                            <Step number="2" title="Añade" desc="Agrégalo al carrito." />
                            <Step number="3" title="Aplica" desc="Selecciona tu gift card al pagar." />
                            <Step number="4" title="Disfruta" desc="Descarga y crea música." />
                        </div>
                    </div>

                    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <FaInfoCircle /> Reglas Importantes
                        </h2>
                        <ul className="space-y-4">
                            <Rule icon={<FaUserLock />} title="Uso Personal" desc="Intransferibles. Solo para tu cuenta." />
                            <Rule icon={<FaCoins />} title="Acumulables" desc="Suma varias gift cards de dinero ($) en una compra." />
                            <Rule icon={<FaPercent />} title="Descuentos Únicos" desc="Los % OFF no son acumulables entre sí." />
                            <Rule icon={<FaInfinity />} title="Sin Expiración" desc="Tus premios nunca caducan." />
                        </ul>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={() => showFeatureModal('Términos')} className="text-purple-500 hover:text-purple-400 font-semibold flex items-center justify-center gap-2 mx-auto">
                        <FaFileContract /> Leer Términos y Condiciones
                    </button>
                </div>

            </div>

            {/* MODALS */}
            {/* 1. Welcome Modal */}
            {activeModal === 'welcome' && (
                <Modal onClose={() => setActiveModal(null)}>
                    <div className="text-6xl text-purple-500 mb-4 mx-auto w-fit"><FaGift /></div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">¡Regalo Reclamado!</h2>
                    <div className="text-4xl font-extrabold text-purple-400 my-6">{formatAmount(5)}</div>
                    <p className="text-[#999] mb-8">Tu saldo ha sido actualizado. ¡Hora de comprar!</p>
                    <button onClick={() => setActiveModal(null)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl w-full transition-colors">Entendido</button>
                </Modal>
            )}

            {/* 2. Prize Modal */}
            {activeModal === 'prize' && prizeWon && (
                <Modal onClose={() => setActiveModal(null)}>
                    <div className="text-6xl text-green-500 mb-4 mx-auto w-fit"><FaTrophy /></div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">¡Felicidades!</h2>
                    <p className="text-[#999]">Has ganado:</p>
                    <div className="text-4xl font-extrabold text-purple-400 my-6">
                        {prizeWon.isDiscount ? `${prizeWon.value}% OFF` : formatAmount(prizeWon.value)}
                    </div>
                    <button onClick={() => setActiveModal(null)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl w-full transition-colors">¡Genial!</button>
                </Modal>
            )}

            {/* 3. Feature Coming Soon Modal (Helper) */}
            <Modal
                isOpen={activeModal === 'feature'}
                onClose={() => setActiveModal(null)}
            >
                <div className="text-6xl text-white mb-4 mx-auto w-fit"><FaRocket /></div>
                <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
                <p className="text-[#999]">Estamos trabajando en esta función.</p>
            </Modal>

        </div>
    );

    function showFeatureModal() {
        setActiveModal('feature');
    }
}

// --- SUB-COMPONENTES PARA LIMPIEZA ---

function Step({ number, title, desc }) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3 shadow-lg">
                {number}
            </div>
            <h3 className="text-white font-bold mb-1">{title}</h3>
            <p className="text-[#888] text-xs leading-relaxed">{desc}</p>
        </div>
    );
}

function Rule({ icon, title, desc }) {
    return (
        <li className="flex items-start gap-4 pb-4 border-b border-[rgba(255,255,255,0.05)] last:border-0">
            <div className="w-10 h-10 bg-[rgba(139,92,246,0.1)] rounded-lg flex items-center justify-center text-purple-500 text-lg shrink-0">
                {icon}
            </div>
            <div>
                <div className="text-white font-bold text-sm mb-1">{title}</div>
                <div className="text-[#666] text-sm leading-relaxed">{desc}</div>
            </div>
        </li>
    );
}

function Modal({ children, onClose, isOpen = true }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl scale-100" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors">
                    <FaTimes size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}