import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'PEN', // Moneda por defecto
      exchangeRate: 3.80, // Tasa fija (según tu utils.js)

      setCurrency: (newCurrency) => set({ currency: newCurrency }),

      // Función helper para usar en componentes
      formatPrice: (priceUSD) => {
        const { currency, exchangeRate } = get();
        if (!priceUSD && priceUSD !== 0) return '';
        
        if (currency === 'PEN') {
          return `S/ ${(priceUSD * exchangeRate).toFixed(2)}`;
        } else {
          return `$ ${parseFloat(priceUSD).toFixed(2)}`;
        }
      }
    }),
    {
      name: 'offszn-currency', // Guardar en localStorage automáticamente
    }
  )
);