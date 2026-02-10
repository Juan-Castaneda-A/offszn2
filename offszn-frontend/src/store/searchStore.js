import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/client';

export const useSearchStore = create(
    persist(
        (set, get) => ({
            query: '',
            category: 'Todo',
            results: [],
            history: ['Dark Piano', 'Tainy Drums'],
            loading: false,

            setQuery: (query) => set({ query }),
            setCategory: (category) => set({ category }),

            performSearch: async (query, category) => {
                if (!query) {
                    set({ results: [] });
                    return;
                }

                set({ loading: true });
                try {
                    let productsQuery = supabase
                        .from('products')
                        .select('id, name, price_basic, image_url, product_type, producer_id')
                        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                        .limit(3);

                    if (category && category !== 'Todo') {
                        const filterMap = {
                            'Beats': 'beat',
                            'Drum Kits': 'drumkit',
                            'Samples': 'loopkit',
                            'Presets': 'preset'
                        };
                        if (filterMap[category]) {
                            productsQuery = productsQuery.eq('product_type', filterMap[category]);
                        }
                    }

                    productsQuery = productsQuery
                        .eq('visibility', 'public')
                        .neq('status', 'draft')
                        .order('created_at', { ascending: false });

                    const { data, error } = await productsQuery;
                    if (error) throw error;

                    set({ results: data || [] });
                } catch (error) {
                    console.error("Search error:", error);
                    set({ results: [] });
                } finally {
                    set({ loading: false });
                }
            },

            addToHistory: (term) => {
                const { history } = get();
                const newHistory = [term, ...history.filter((t) => t !== term)].slice(0, 50);
                set({ history: newHistory });
            },

            removeHistoryItem: (term) => {
                const { history } = get();
                set({ history: history.filter((t) => t !== term) });
            }
        }),
        {
            name: 'offszn-search-history',
            partialize: (state) => ({ history: state.history }),
        }
    )
);
