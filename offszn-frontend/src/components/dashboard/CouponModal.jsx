import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Sparkles, Percent, DollarSign,
    Calendar, Target, ShoppingCart,
    Search, Save, AlertCircle, CheckCircle2,
    Package, LayoutGrid, Globe
} from 'lucide-react';
import { supabase } from '../api/client';
import { useAuth } from '../store/authStore';
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">

                {/* Left Side: Form */}
                <div className="flex-1 p-8 md:p-12 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Sparkles className="text-violet-500" size={28} />
                            {editingCoupon ? 'Editar Cupón' : 'Configurar Cupón'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Crea ofertas exclusivas para tus seguidores</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Column 1: Core */}
                        <div className="space-y-6">
                            {/* Code Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Código del Cupón</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-800 uppercase"
                                        placeholder="EJ: VERANO20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        maxLength={15}
                                    />
                                    <button
                                        onClick={generateMagicCode}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-xl text-violet-500 transition-colors"
                                        title="Generar Código Mágico"
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Discount Type & Value */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Descuento</label>
                                <div className="flex gap-2 p-1 bg-black border border-white/5 rounded-2xl">
                                    <button
                                        onClick={() => setFormData({ ...formData, discount_type: 'percent' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.discount_type === 'percent' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Porcentaje (%)
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, discount_type: 'fixed' })}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.discount_type === 'fixed' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Monto Fijo ($)
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        {formData.discount_type === 'percent' ? <Percent size={14} /> : <DollarSign size={14} />}
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all"
                                        placeholder={formData.discount_type === 'percent' ? "20" : "5.00"}
                                        value={formData.temp_amount}
                                        onChange={(e) => setFormData({ ...formData, temp_amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Applies To */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Aplica A</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <ScopeBtn
                                        active={formData.applies_to === 'all'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'all', applies_to_id: null })}
                                        icon={Globe}
                                        label="Todo"
                                    />
                                    <ScopeBtn
                                        active={formData.applies_to === 'product'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'product' })}
                                        icon={Package}
                                        label="Producto"
                                    />
                                    <ScopeBtn
                                        active={formData.applies_to === 'category'}
                                        onClick={() => setFormData({ ...formData, applies_to: 'category' })}
                                        icon={LayoutGrid}
                                        label="Categoría"
                                    />
                                </div>

                                {formData.applies_to === 'product' && (
                                    <div className="space-y-4 pt-2">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                            <input
                                                type="text"
                                                className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-10 text-[10px] font-bold text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-800"
                                                placeholder="Buscar beat o kit..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        {searching && <div className="text-[9px] font-bold text-violet-500 animate-pulse px-4 uppercase tracking-widest">Buscando...</div>}
                                        {searchResults.length > 0 && (
                                            <div className="bg-black border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                                                {searchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setFormData({ ...formData, applies_to_id: p.id });
                                                            setSearchResults([]);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden">
                                                            <img src={p.cover_url || p.image_url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-300">{p.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {selectedProduct && (
                                            <div className="flex items-center justify-between p-3 bg-violet-500/5 border border-violet-500/20 rounded-2xl animate-in slide-in-from-top-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden">
                                                        <img src={selectedProduct.cover_url || selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">{selectedProduct.name}</span>
                                                </div>
                                                <button onClick={() => { setSelectedProduct(null); setFormData({ ...formData, applies_to_id: null }); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.applies_to === 'category' && (
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all cursor-pointer"
                                        value={formData.applies_to_id || ''}
                                        onChange={(e) => setFormData({ ...formData, applies_to_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar Categoría...</option>
                                        <option value="Beats">Beats</option>
                                        <option value="Drum Kits">Drum Kits</option>
                                        <option value="Loop Kits">Loop Kits</option>
                                        <option value="Sound Kits">Sound Kits</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Advanced */}
                        <div className="space-y-6">
                            {/* Start Date */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Fecha de Inicio</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Optional Expiry */}
                            <AdvancedOption
                                label="¿Tiene fecha de expiración?"
                                active={showOptions.valid_to}
                                toggle={() => setShowOptions({ ...showOptions, valid_to: !showOptions.valid_to })}
                            >
                                <input
                                    type="date"
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
                                    value={formData.valid_to || ''}
                                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                />
                            </AdvancedOption>

                            {/* Usage Limit */}
                            <AdvancedOption
                                label="¿Limitar redenciones totales?"
                                active={showOptions.uses_limit}
                                toggle={() => setShowOptions({ ...showOptions, uses_limit: !showOptions.uses_limit })}
                            >
                                <input
                                    type="number"
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all"
                                    placeholder="Ej: 100"
                                    value={formData.uses_limit || ''}
                                    onChange={(e) => setFormData({ ...formData, uses_limit: parseInt(e.target.value) || null })}
                                />
                            </AdvancedOption>

                            {/* Min Purchase */}
                            <AdvancedOption
                                label="¿Requerir monto mínimo?"
                                active={showOptions.min_purchase}
                                toggle={() => setShowOptions({ ...showOptions, min_purchase: !showOptions.min_purchase })}
                            >
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="0.00"
                                        value={formData.min_purchase_amount || ''}
                                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </AdvancedOption>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview & Actions */}
                <div className="w-full md:w-80 bg-white/[0.02] border-l border-white/5 p-8 md:p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 mb-6">
                                <Target size={14} /> Vista Previa
                            </h3>

                            {/* Preview Card */}
                            <div className="bg-black border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                                        {selectedProduct ? (
                                            <img src={selectedProduct.cover_url || selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-800">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black uppercase tracking-tight text-white truncate">
                                            {selectedProduct ? selectedProduct.name : 'Tu Producto'}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                                            <ShoppingCart size={10} /> {formData.code || 'CÓDIGO'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-gray-500">Precio Base</span>
                                        <span className="text-white">${selectedProduct?.price_basic || '29.99'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black">
                                        <span className="text-emerald-500">Descuento</span>
                                        <span className="text-emerald-500">
                                            -{isPercent ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs font-black pt-2 text-white border-t border-white/5">
                                        <span>Total</span>
                                        <span className="text-violet-500">
                                            ${(Math.max(0, (selectedProduct?.price_basic || 29.99) - (isPercent ? (selectedProduct?.price_basic || 29.99) * (discountValue / 100) : discountValue))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                <CheckCircle2 className="text-violet-500 mt-0.5" size={12} />
                                <span>Código único e irrepetible</span>
                            </li>
                            <li className="flex items-start gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                <CheckCircle2 className="text-violet-500 mt-0.5" size={12} />
                                <span>Activación instantánea</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full px-8 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? 'Guardando...' : (editingCoupon ? 'Actualizar' : 'Crear Cupón')}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ScopeBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${active ? 'bg-violet-500/10 border-violet-500/30 text-violet-500' : 'bg-black border-white/5 text-gray-600 hover:text-white hover:border-white/10'}`}
        >
            <Icon size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

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
