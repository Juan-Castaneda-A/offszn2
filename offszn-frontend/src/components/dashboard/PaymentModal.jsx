import React, { useState } from 'react';
import {
    X, CreditCard, Smartphone,
    Globe, ShieldCheck, CheckCircle2,
    DollarSign, ExternalLink, Download,
    MessageCircle
} from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import yapeQr from '../../assets/images/yape.jpg';

export default function PaymentModal({
    isOpen,
    onClose,
    currency,
    price,
    onSuccess,
    userEmail
}) {
    const [activeMethod, setActiveMethod] = useState(currency === 'USD' ? 'paypal' : 'yape');

    if (!isOpen) return null;

    const handleWhatsApp = (method) => {
        const links = {
            yape: "https://wa.link/l31al5",
            wu: "https://wa.link/f6re2z"
        };
        window.open(links[method], '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <CreditCard className="text-violet-500" size={24} />
                            Finalizar Suscripción
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Paquete Pro Artist</span>
                            <span className="text-[10px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                                {currency === 'USD' ? `$${price}` : `S/${price}`} / mes
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Payment Methods Accordion */}
                    <div className="space-y-4">

                        {/* PayPal (USD Only) */}
                        {currency === 'USD' && (
                            <PaymentMethod
                                id="paypal"
                                icon={Globe}
                                label="PayPal / Tarjeta"
                                active={activeMethod === 'paypal'}
                                onClick={() => setActiveMethod('paypal')}
                            >
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center mb-2">
                                        Procesamiento automático e instantáneo
                                    </div>
                                    <PayPalButtons
                                        style={{ layout: "vertical", shape: "pill", label: "pay" }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [{
                                                    description: "OFFSZN Pro Artist (1 Mes)",
                                                    amount: { value: price.toString() }
                                                }]
                                            });
                                        }}
                                        onApprove={(data, actions) => {
                                            return actions.order.capture().then((details) => {
                                                onSuccess(details.id, 'paypal_onetime');
                                            });
                                        }}
                                    />
                                </div>
                            </PaymentMethod>
                        )}

                        {/* Yape / Plin (PEN Only) */}
                        {currency === 'PEN' && (
                            <PaymentMethod
                                id="yape"
                                icon={Smartphone}
                                label="Yape / Plin"
                                active={activeMethod === 'yape'}
                                onClick={() => setActiveMethod('yape')}
                            >
                                <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/2 flex flex-col items-center">
                                        <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 border-white/5 bg-white p-2">
                                            <img src={yapeQr} alt="QR Yape" className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <a
                                            href={yapeQr}
                                            download
                                            className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-white transition-colors"
                                        >
                                            <Download size={12} /> Descargar QR
                                        </a>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Instrucciones:</h4>
                                            <ol className="text-[10px] font-bold text-gray-500 space-y-2">
                                                <li className="flex gap-2"><span className="text-violet-500">1.</span> Escanea el código QR desde tu App</li>
                                                <li className="flex gap-2"><span className="text-violet-500">2.</span> Paga el monto exacto (S/ {price}.00)</li>
                                                <li className="flex gap-2"><span className="text-violet-500">3.</span> Envía captura por WhatsApp</li>
                                            </ol>
                                        </div>
                                        <button
                                            onClick={() => handleWhatsApp('yape')}
                                            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                                        >
                                            <MessageCircle size={16} /> Enviar Comprobante
                                        </button>
                                    </div>
                                </div>
                            </PaymentMethod>
                        )}

                        {/* Western Union (USD Only) */}
                        {currency === 'USD' && (
                            <PaymentMethod
                                id="wu"
                                icon={Globe}
                                label="Western Union / Transferencia"
                                active={activeMethod === 'wu'}
                                onClick={() => setActiveMethod('wu')}
                            >
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <WUField label="Beneficiario" value="Wilbert Garay Sosa" />
                                        <WUField label="DNI" value="23847731" />
                                        <WUField label="Ciudad" value="Lima" />
                                        <WUField label="País" value="Perú" />
                                    </div>
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <p className="text-[9px] font-bold text-amber-500 uppercase leading-relaxed text-center">
                                            * Las comisiones de envío son cubiertas por el cliente. Envía el código MTCN por WhatsApp.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleWhatsApp('wu')}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-violet-500 hover:text-white transition-all"
                                    >
                                        <MessageCircle size={16} /> Confirmar MTCN
                                    </button>
                                </div>
                            </PaymentMethod>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-8 pt-4 grayscale opacity-50">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Pago Seguro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Soporte 24/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentMethod({ id, icon: Icon, label, active, onClick, children }) {
    return (
        <div className={`overflow-hidden rounded-3xl border transition-all ${active ? 'border-violet-500/50 bg-white/[0.02]' : 'border-white/5 hover:border-white/10'}`}>
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-5 text-left transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 text-gray-500'}`}>
                        <Icon size={18} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-violet-500 bg-violet-500' : 'border-white/10'}`}>
                    {active && <CheckCircle2 className="text-white" size={12} />}
                </div>
            </button>
            {active && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}

function WUField({ label, value }) {
    return (
        <div className="space-y-1">
            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">{label}</span>
            <div className="text-[10px] font-black text-white truncate">{value}</div>
        </div>
    );
}
