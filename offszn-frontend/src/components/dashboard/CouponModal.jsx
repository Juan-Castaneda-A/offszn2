import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Sparkles, Percent, DollarSign,
    Calendar, Target, ShoppingCart,
    Search, Save, AlertCircle, CheckCircle2,
    Package, LayoutGrid, Globe, ChevronRight,
    ArrowRight, Info, Zap
} from 'lucide-react';
import { supabase } from '../../api/client';
import { useAuth } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CouponModal({
    isOpen,
    onClose,
    onSave,
    editingCoupon = null,
    saving = false
}) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: null,
        discount_amount: null,
        discount_type: 'percent', // internal state for toggle
        applies_to: 'all',
        applies_to_id: null,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: null,
        uses_limit: null,
        min_purchase_amount: 0,
        temp_amount: ''
    });

    const [showOptions, setShowOptions] = useState({
        valid_to: false,
        uses_limit: false,
        min_purchase: false
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Initialize form when editing
    useEffect(() => {
        if (isOpen && editingCoupon) {
            const type = editingCoupon.discount_percent !== null ? 'percent' : 'fixed';
            const amount = type === 'percent' ? editingCoupon.discount_percent : editingCoupon.discount_amount;

            setFormData({
                ...editingCoupon,
                discount_type: type,
                temp_amount: amount.toString(),
                valid_from: editingCoupon.valid_from ? editingCoupon.valid_from.split('T')[0] : '',
                valid_to: editingCoupon.valid_to ? editingCoupon.valid_to.split('T')[0] : null
            });

            setShowOptions({
                valid_to: !!editingCoupon.valid_to,
                uses_limit: !!editingCoupon.uses_limit,
                min_purchase: !!editingCoupon.min_purchase_amount
            });

            if (editingCoupon.applies_to === 'product' && editingCoupon.applies_to_id) {
                fetchProductDetails(editingCoupon.applies_to_id);
            }
        } else if (isOpen) {
            // Reset for new coupon
            setFormData({
                code: '',
                discount_percent: null,
                discount_amount: null,
                discount_type: 'percent',
                applies_to: 'all',
                applies_to_id: null,
                valid_from: new Date().toISOString().split('T')[0],
                valid_to: null,
                uses_limit: null,
                min_purchase_amount: 0,
                temp_amount: ''
            });
            setShowOptions({
                valid_to: false,
                uses_limit: false,
                min_purchase: false
            });
            setSelectedProduct(null);
        }
    }, [isOpen, editingCoupon]);

    const fetchProductDetails = async (id) => {
        try {
            const { data } = await supabase
                .from('products')
                .select('id, name, price_basic, image_url, cover_url')
                .eq('id', id)
                .single();
            if (data) setSelectedProduct(data);
        } catch (err) {
            console.error(err);
        }
    };

    const generateMagicCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: `OFFSZN-${code}` }));
    };

    const handleSearch = useCallback(async (query) => {
        if (!user || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const { data } = await supabase
                .from('products')
                .select('id, name, price_basic, image_url, cover_url')
                .eq('producer_id', user.id)
                .ilike('name', `%${query}%`)
                .eq('status', 'approved')
                .limit(5);
            setSearchResults(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    }, [user]);

    useEffect(() => {
        const timeout = setTimeout(() => handleSearch(searchQuery), 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, handleSearch]);

    const handleSave = () => {
        // Validation
        if (!formData.code) return toast.error("Ingresa un código");
        if (!formData.temp_amount) return toast.error("Ingresa el valor del descuento");

        const amount = parseFloat(formData.temp_amount);
        if (formData.discount_type === 'percent' && (amount < 1 || amount > 100)) {
            return toast.error("Porcentaje inválido (1-100)");
        }
        if (formData.discount_type === 'fixed' && (amount < 1 || amount > 1000)) {
            return toast.error("Monto fijo inválido ($1-$1000)");
        }

        if (formData.applies_to === 'product' && !formData.applies_to_id) {
            return toast.error("Selecciona un producto");
        }

        const finalData = {
            ...formData,
            discount_percent: formData.discount_type === 'percent' ? amount : null,
            discount_amount: formData.discount_type === 'fixed' ? amount : null,
            valid_to: showOptions.valid_to ? formData.valid_to : null,
            uses_limit: showOptions.uses_limit ? formData.uses_limit : null,
            min_purchase_amount: showOptions.min_purchase ? formData.min_purchase_amount : 0
        };

        // Remove internal fields
        delete finalData.discount_type;
        delete finalData.temp_amount;

        onSave(finalData);
    };

    if (!isOpen) return null;

    const discountValue = parseFloat(formData.temp_amount) || 0;
    const isPercent = formData.discount_type === 'percent';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-[#070707] border border-white/5 rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col lg:flex-row">

                {/* Left Side: Form */}
                <div className="flex-1 p-10 lg:p-14 space-y-12 max-h-[90vh] overflow-y-auto custom-scrollbar">

                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-white">
                                <Sparkles className="text-violet-500" size={32} />
                                {editingCoupon ? 'Editar Campaña' : 'Nueva Campaña'}
                            </h2>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-3">Configura tu estrategia de marketing para máximo impacto</p>
                        </div>
                        <button onClick={onClose} className="lg:hidden p-3 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Column 1: Core Params */}
                        <div className="space-y-10">
                            {/* Code Input */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Código Viral</label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-white/5 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-900 uppercase tracking-widest"
                                        placeholder="EJ: VERANO2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        maxLength={15}
                                    />
                                    <button
                                        onClick={generateMagicCode}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-violet-500 hover:text-white rounded-2xl text-violet-500 transition-all group/magic"
                                        title="Sugerir código optimizado"
                                    >
                                        <Sparkles size={18} className="group-hover/magic:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Discount Logic */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Regla de Descuento</label>
                                <div className="flex gap-2 p-1.5 bg-black border border-white/5 rounded-[26px]">
                                    <button
                                        onClick={() => setFormData({ ...formData, discount_type: 'percent' })}
                                        className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${formData.discount_type === 'percent' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Porcentaje (%)
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, discount_type: 'fixed' })}
                                        className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${formData.discount_type === 'fixed' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Monto Fijo ($)
                                    </button>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500">
                                        {formData.discount_type === 'percent' ? <Percent size={18} /> : <DollarSign size={18} />}
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/5 rounded-3xl p-6 pl-14 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all"
                                        placeholder={formData.discount_type === 'percent' ? "0 a 100" : "0.00"}
                                        value={formData.temp_amount}
                                        onChange={(e) => setFormData({ ...formData, temp_amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Targetting */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Segmentación de Producto</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <ScopeBtn
                                        active={formData.applies_to === 'all'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'all', applies_to_id: null })}
                                        icon={Globe}
                                        label="Global"
                                    />
                                    <ScopeBtn
                                        active={formData.applies_to === 'product'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'product' })}
                                        icon={Package}
                                        label="Beat"
                                    />
                                    <ScopeBtn
                                        active={formData.applies_to === 'category'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'category' })}
                                        icon={LayoutGrid}
                                        label="Bundle"
                                    />
                                </div>

                                {formData.applies_to === 'product' && (
                                    <div className="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-500">
                                        <div className="relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-hover:text-violet-500 transition-colors" size={16} />
                                            <input
                                                type="text"
                                                className="w-full bg-black border border-white/5 rounded-2xl p-5 pl-12 text-[11px] font-black text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-800"
                                                placeholder="Buscar por nombre..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {searching && (
                                            <div className="flex items-center gap-2 px-6">
                                                <Loader2 className="animate-spin text-violet-500" size={12} />
                                                <span className="text-[9px] font-black text-violet-500/50 uppercase tracking-[0.3em]">Rastreando catálogo...</span>
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="bg-black border border-white/5 rounded-[24px] overflow-hidden divide-y divide-white/5 shadow-2xl">
                                                {searchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setFormData({ ...formData, applies_to_id: p.id });
                                                            setSearchResults([]);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all text-left group/item"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/5">
                                                                <img src={p.cover_url || p.image_url} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-tight text-white group-hover/item:text-violet-400 transition-colors">{p.name}</span>
                                                        </div>
                                                        <ChevronRight size={14} className="text-gray-800 group-hover/item:text-violet-500 transition-all group-hover/item:translate-x-1" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedProduct && (
                                            <div className="flex items-center justify-between p-4 bg-violet-600/5 border border-violet-500/20 rounded-[28px] animate-in slide-in-from-top-6 duration-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-violet-500/30">
                                                        <img src={selectedProduct.cover_url || selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-violet-600/20"></div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest block">{selectedProduct.name}</span>
                                                        <span className="text-[9px] font-bold text-violet-400/50 uppercase tracking-widest mt-0.5 animate-pulse">Producto Vinculado</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedProduct(null); setFormData({ ...formData, applies_to_id: null }); }}
                                                    className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.applies_to === 'category' && (
                                    <div className="pt-4 animate-in slide-in-from-top-4 duration-500">
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-3xl p-6 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-violet-500/50 transition-all cursor-pointer appearance-none"
                                            value={formData.applies_to_id || ''}
                                            onChange={(e) => setFormData({ ...formData, applies_to_id: e.target.value })}
                                        >
                                            <option value="" className="bg-black">Seleccionar Categoría...</option>
                                            <option value="Beats" className="bg-black text-white">BRITISH BEATS (MP3/WAV)</option>
                                            <option value="Drum Kits" className="bg-black text-white">PROFESSIONAL KITS</option>
                                            <option value="Loop Kits" className="bg-black text-white">MELODIC BUNDLES</option>
                                            <option value="Sound Kits" className="bg-black text-white">PRESET PACKS</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Advanced Logistics */}
                        <div className="space-y-10">
                            {/* Start Date */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Lanzamiento</label>
                                <div className="relative group/input">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/5 rounded-3xl p-6 pl-14 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Optional Settings Stack */}
                            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] space-y-10">
                                <AdvancedToggle
                                    label="Programar Expiración"
                                    description="Finaliza la campaña automáticamente"
                                    active={showOptions.valid_to}
                                    toggle={() => setShowOptions({ ...showOptions, valid_to: !showOptions.valid_to })}
                                >
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
                                        value={formData.valid_to || ''}
                                        onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                    />
                                </AdvancedToggle>

                                <AdvancedToggle
                                    label="Límite de Redenciones"
                                    description="Cantidad máxima de usos totales"
                                    active={showOptions.uses_limit}
                                    toggle={() => setShowOptions({ ...showOptions, uses_limit: !showOptions.uses_limit })}
                                >
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="Ej: 50 cupones"
                                        value={formData.uses_limit || ''}
                                        onChange={(e) => setFormData({ ...formData, uses_limit: parseInt(e.target.value) || null })}
                                    />
                                </AdvancedToggle>

                                <AdvancedToggle
                                    label="Incentivo de Carrito"
                                    description="Requiere un monto mínimo de compra"
                                    active={showOptions.min_purchase}
                                    toggle={() => setShowOptions({ ...showOptions, min_purchase: !showOptions.min_purchase })}
                                >
                                    <div className="relative">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                                        <input
                                            type="number"
                                            className="w-full bg-black border border-white/10 rounded-2xl p-5 pl-12 text-sm font-black text-white outline-none focus:border-violet-500/50 transition-all"
                                            placeholder="Ej: 50.00"
                                            value={formData.min_purchase_amount || ''}
                                            onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </AdvancedToggle>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Smart Preview & Checkout Logic */}
                <div className="w-full lg:w-[400px] bg-[#0A0A0A] border-l border-white/5 p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] pointer-events-none"></div>

                    <div className="space-y-12 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/5"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Preview Hub</span>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>

                        {/* Dynamic Preview Card */}
                        <div className="bg-black border border-white/5 rounded-[40px] p-8 space-y-8 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/5 rounded-[20px] overflow-hidden border border-white/5 flex items-center justify-center p-0.5 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                    {selectedProduct ? (
                                        <img src={selectedProduct.cover_url || selectedProduct.image_url} alt="" className="w-full h-full object-cover rounded-[18px]" />
                                    ) : (
                                        <Package size={24} className="text-gray-800" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-white truncate">
                                        {selectedProduct ? selectedProduct.name : 'Venta Global'}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black tracking-[0.2em] text-violet-500 uppercase">{formData.code || 'CODE'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-600 uppercase tracking-widest">Base de Venta</span>
                                    <span className="text-gray-400 font-mono tracking-tighter">${selectedProduct?.price_basic || '29.99'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black">
                                    <div className="flex items-center gap-2 text-emerald-500 uppercase tracking-widest">
                                        <Zap size={10} /> Impacto Cupón
                                    </div>
                                    <span className="text-emerald-500 font-mono">
                                        — {isPercent ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="block text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">Precio Final Cliente</span>
                                            <span className="text-4xl font-black text-white tracking-widest">
                                                ${(Math.max(0, (selectedProduct?.price_basic || 29.99) - (isPercent ? (selectedProduct?.price_basic || 29.99) * (discountValue / 100) : discountValue))).toFixed(2)}
                                            </span>
                                        </div>
                                        <ArrowRight size={24} className="text-violet-500/50 mb-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.01] border border-white/5">
                                <ShieldAlert size={16} className="text-violet-500 shrink-0" />
                                <div className="space-y-1">
                                    <span className="block text-[10px] font-black text-white uppercase tracking-widest">Integridad de Campaña</span>
                                    <span className="block text-[9px] font-bold text-gray-700 uppercase tracking-wider leading-relaxed">Protección anti-spam y validación en checkout en tiempo real.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-12 relative z-10">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group w-full px-8 py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-violet-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.05)] disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                            {saving ? 'PROCESANDO...' : (editingCoupon ? 'ACTUALIZAR' : 'ACTIVAR CUPÓN')}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-8 py-6 bg-transparent border border-white/5 text-gray-600 hover:text-white hover:border-white/10 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95"
                        >
                            DESCARTAR
                        </button>
                    </div>

                    {/* Background Detail */}
                    <Info size={250} className="absolute -left-20 -bottom-20 text-white opacity-[0.01] rotate-12 pointer-events-none" />
                </div>

            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function ScopeBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] border transition-all duration-500 group ${active
                ? 'bg-white border-white text-black shadow-2xl'
                : 'bg-black border-white/5 text-gray-700 hover:text-gray-400 hover:border-white/10'
                }`}
        >
            <Icon size={20} className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

function AdvancedToggle({ label, description, active, toggle, children }) {
    return (
        <div className="space-y-4">
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between group"
            >
                <div className="text-left">
                    <span className={`block text-[11px] font-black uppercase tracking-widest transition-colors ${active ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}`}>{label}</span>
                    <span className="block text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-1">{description}</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${active ? 'bg-violet-500' : 'bg-white/5 border border-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </button>
            {active && (
                <div className="animate-in slide-in-from-top-4 duration-500 pt-2 pb-2">
                    {children}
                </div>
            )}
        </div>
    );
}

// function ScopeBtn({ active, onClick, icon: Icon, label }) {
//     return (
//         <button
//             onClick={onClick}
//             className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${active ? 'bg-violet-500/10 border-violet-500/30 text-violet-500' : 'bg-black border-white/5 text-gray-600 hover:text-white hover:border-white/10'}`}
//         >
//             <Icon size={16} />
//             <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
//         </button>
//     );
// }

function AdvancedOption({ label, active, toggle, children }) {
    return (
        <div className="space-y-3">
            <button
                onClick={toggle}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${active ? 'bg-violet-500 border-violet-500' : 'border-white/20'}`}>
                    {active && <CheckCircle2 className="text-white" size={10} />}
                </div>
                {label}
            </button>
            {active && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
