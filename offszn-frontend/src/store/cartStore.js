import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,

      // Abrir/Cerrar UI
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Acciones de Producto
      addToCart: (product, licenseId = 'basic') => {
        const { cart } = get();
        
        // Evitar duplicados exactos (mismo ID + misma licencia)
        const exists = cart.find(item => item.id === product.id && item.licenseId === licenseId);
        
        if (exists) {
            // Opcional: Podrías incrementar cantidad aquí si fuera e-commerce normal
            set({ isOpen: true }); // Solo abrir si ya existe
            return; 
        }

        // Definir precio según licencia (Lógica simplificada por ahora)
        let finalPrice = product.price_basic || 0;
        let licenseName = 'Basic Lease';

        // Si tuviéramos lógica de licencias real aquí, la aplicaríamos
        // Por ahora asumimos Basic si no se pasa nada específico
        
        const newItem = {
            ...product,
            licenseId,
            licenseName,
            finalPrice,
            addedAt: new Date().toISOString()
        };

        set({ 
            cart: [...cart, newItem],
            isOpen: true 
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId)
        }));
      },

      clearCart: () => set({ cart: [] }),

      // Computed: Total
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.finalPrice || 0), 0);
      }
    }),
    {
      name: 'offszn-cart-storage', // Nombre en LocalStorage
    }
  )
);