import React from 'react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeFromCart, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={closeCart}
      ></div>

      {/* Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#111]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="bi bi-cart3"></i> Tu Carrito
            <span className="text-sm bg-violet-600 text-white px-2 py-0.5 rounded-full">{items.length}</span>
          </h2>
          <button onClick={closeCart} className="text-zinc-400 hover:text-white text-2xl">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body (Lista de Items) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <i className="bi bi-cart-x text-6xl opacity-50"></i>
              <p>Tu carrito está vacío</p>
              <button onClick={closeCart} className="text-violet-400 hover:underline">
                Seguir explorando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.licenseId}`} className="flex gap-4 bg-[#141414] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                {/* Imagen */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{item.name}</h4>
                  <p className="text-zinc-500 text-xs truncate">{item.producer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-violet-400 text-sm font-bold">{item.price ? `$${item.price}` : 'Gratis'}</span>
                  </div>
                </div>

                {/* Botón Borrar */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-zinc-600 hover:text-red-500 self-center p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total & Checkout) */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-[#111]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-white">${getCartTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-violet-900/20"
            >
              <i className="bi bi-credit-card-2-front-fill"></i>
              Ir a Pagar
            </button>
            <div className="mt-3 flex justify-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <i className="bi bi-paypal text-xl"></i>
              <i className="bi bi-credit-card text-xl"></i>
              <i className="bi bi-shield-lock text-xl"></i>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default CartSidebar;