import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useSearchStore } from '../../store/searchStore';
import { useCurrencyStore } from '../../store/currencyStore';

const SEARCH_FILTERS = ['Todo', 'Beats', 'Drum Kits', 'Samples', 'Presets', 'Plantillas', 'Voces', 'Productores'];

const SearchBar = () => {
  const navigate = useNavigate();
  const {
    query, setQuery,
    category, setCategory,
    results, performSearch,
    history, addToHistory, removeHistoryItem,
    loading
  } = useSearchStore();

  const { formatPrice } = useCurrencyStore();
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceTimer.current);
    if (val.trim()) {
      debounceTimer.current = setTimeout(() => {
        performSearch(val, category);
      }, 300);
    }
  };

  const handleKeyDown = (e) => {
    const itemsCount = query.length === 0 ? history.length + 3 : results.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % itemsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + itemsCount) % itemsCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Handle selection logic here
      } else {
        submitSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const submitSearch = (term) => {
    if (!term.trim()) return;
    addToHistory(term.trim());
    setIsFocused(false);
    navigate(`/explorar?q=${encodeURIComponent(term)}&type=${encodeURIComponent(category)}`);
  };

  return (
    <div className="relative w-125 max-w-125" ref={containerRef}>
      {/* INPUT CONTAINER */}
      <div className={clsx(
        "flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-200",
        isFocused
          ? "bg-secondary border-[#333] z-1002"
          : "bg-[#141414] border-transparent hover:bg-[#1a1a1a]"
      )}>
        <Search className="w-4 h-4 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar 'trap' o 'drill'..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {/* FILTER TRIGGER */}
        <div
          className={clsx(
            "flex items-center gap-1 cursor-pointer text-xs font-medium px-2 py-1 rounded transition-colors",
            category !== 'Todo' ? "bg-white/10 text-white border border-white/20" : "text-gray-400 hover:text-white"
          )}
          onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
        >
          <span>{category}</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* FILTER DROPDOWN */}
      {showFilterMenu && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-[#080808] border border-white/10 rounded-xl p-2 shadow-2xl z-1003 animate-in fade-in zoom-in-95 duration-100">
          {SEARCH_FILTERS.map(filter => (
            <div
              key={filter}
              className={clsx(
                "px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2",
                category === filter ? "bg-primary/10 text-primary font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => { setCategory(filter); setShowFilterMenu(false); if (query) performSearch(query, filter); }}
            >
              {filter}
            </div>
          ))}
        </div>
      )}

      {/* RESULTS / HISTORY PANEL */}
      {isFocused && (
        <div className="absolute top-full left-0 w-full mt-3 bg-[#080808] border border-white/15 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,1)] p-4 z-1002">

          {query.length === 0 ? (
            <>
              {history.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider font-['Plus_Jakarta_Sans']">Búsquedas Recientes</span>
                    <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => navigate('/history')}>Ver todo</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {history.slice(0, 5).map(term => (
                      <div key={term} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white group transition-colors" onClick={() => submitSearch(term)}>
                        <Clock className="w-3 h-3 opacity-50" />
                        <span className="flex-1 text-sm">{term}</span>
                        <X
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); removeHistoryItem(term); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="block text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider mb-3 font-['Plus_Jakarta_Sans']">Tendencias Ahora</span>
                <div className="flex flex-wrap gap-2">
                  {['Dark Trap', 'Reggaeton 2025', 'Drill UK'].map(trend => (
                    <div
                      key={trend}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300 hover:bg-primary/10 hover:text-white hover:border-primary/30 border border-transparent transition-all cursor-pointer"
                      onClick={() => submitSearch(trend)}
                    >
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Buscando...</div>
              ) : results.length > 0 ? (
                results.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => {
                      addToHistory(query);
                      setIsFocused(false);
                      navigate(`/producto/${item.id}`);
                    }}
                  >
                    <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.product_type}</div>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {item.price_basic ? formatPrice(item.price_basic) : 'Gratis'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BACKDROP */}
      {isFocused && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-1001" style={{ top: '60px' }} />
      )}
    </div>
  );
};

export default SearchBar;