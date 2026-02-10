import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, User, Mail,
    Percent, ShieldCheck, AlertCircle, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CollabInviteModal({
    isOpen,
    onClose,
    products,
    onSave,
    saving = false
}) {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [splits, setSplits] = useState([
        { id: 'owner', email: 'Tú (Propietario)', percent: 100, isOwner: true }
    ]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct('');
            setSplits([{ id: 'owner', email: 'Tú (Propietario)', percent: 100, isOwner: true }]);
        }
    }, [isOpen]);

    const calculateTotal = (currentSplits) => {
        return currentSplits.reduce((acc, curr) => acc + (parseInt(curr.percent) || 0), 0);
    };

    const totalPercent = calculateTotal(splits);
    const isTotalValid = totalPercent === 100;

    const addCollaborator = () => {
        setSplits([...splits, {
            id: Date.now().toString(),
            email: '',
            percent: 0,
            isOwner: false
        }]);
    };

    const removeCollaborator = (id) => {
        setSplits(splits.filter(s => s.id !== id));
    };

    const updateSplit = (id, field, value) => {
        const newSplits = splits.map(s => {
            if (s.id === id) {
                let val = value;
                if (field === 'percent') {
                    val = Math.min(100, Math.max(0, parseInt(value) || 0));
                }
                return { ...s, [field]: val };
            }
            return s;
        });
        setSplits(newSplits);
    };

    const handleSave = () => {
        if (!selectedProduct) {
            toast.error("Selecciona un beat o proyecto");
            return;
        }
        if (!isTotalValid) {
            toast.error("El total debe sumar exactamente 100%");
            return;
        }

        // Email validation
        const invalidEmails = splits.filter(s => !s.isOwner && (!s.email || !s.email.includes('@')));
        if (invalidEmails.length > 0) {
            toast.error("Asegúrate de que todos los correos sean válidos");
            return;
        }

        onSave(selectedProduct, splits);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <ShieldCheck className="text-violet-500" size={24} />
                            Gestión de Royalties
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                            Define cómo se reparten los ingresos de este beat
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

                    {/* Product Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Beat / Proyecto</label>
                        <select
                            className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Seleccionar Beat...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Splits List */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Reparto de Porcentajes</label>

                        <div className="space-y-3">
                            {splits.map((split) => (
                                <div
                                    key={split.id}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${split.isOwner ? 'bg-violet-500/5 border-violet-500/20' : 'bg-black border-white/5'}`}
                                >
                                    {/* Email/Name Input */}
                                    <div className="relative flex-1">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                            {split.isOwner ? <User size={16} /> : <Mail size={16} />}
                                        </div>
                                        <input
                                            type="text"
                                            disabled={split.isOwner}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-3 pl-10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition-all disabled:opacity-50"
                                            placeholder="Email del colaborador"
                                            value={split.email}
                                            onChange={(e) => updateSplit(split.id, 'email', e.target.value)}
                                        />
                                    </div>

                                    {/* Percent Input */}
                                    <div className="relative w-24">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                                            <Percent size={14} />
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full bg-black/40 border border-white/5 rounded-xl p-3 pr-10 text-xs font-bold text-white text-center outline-none focus:border-violet-500/50 transition-all"
                                            value={split.percent}
                                            onChange={(e) => updateSplit(split.id, 'percent', e.target.value)}
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    {/* Action Button */}
                                    {!split.isOwner && (
                                        <button
                                            onClick={() => removeCollaborator(split.id)}
                                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {split.isOwner && <div className="w-[42px]"></div>}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCollaborator}
                            className="w-full p-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} />
                            Agregar Colaborador
                        </button>
                    </div>
                </div>

                {/* Footer / Total Bar */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Asignado:</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-black ${isTotalValid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {totalPercent}%
                            </div>
                        </div>
                        {!isTotalValid && (
                            <div className="flex items-center gap-1.5 text-red-500">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">El total debe ser 100%</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !isTotalValid}
                            className="flex-1 px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
