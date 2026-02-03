import React from 'react';
import { Tag, Hash, Calendar, Globe, Lock, EyeOff, DollarSign, Percent } from 'lucide-react';

const MUSIC_KEYS = [
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
  'C Maj', 'C# Maj', 'D Maj', 'D# Maj', 'E Maj', 'F Maj', 'F# Maj', 'G Maj', 'G# Maj', 'A Maj', 'A# Maj', 'B Maj'
];

export default function UploadStep2Metadata({ formData, updateFormData }) {

  // --- LÓGICA DE TAGS ---
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !formData.tags.includes(val) && formData.tags.length < 5) {
        updateFormData('tags', [...formData.tags, val]);
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData('tags', formData.tags.filter(t => t !== tagToRemove));
  };

  // --- LÓGICA DE LICENCIAS ---
  const handleLicenseChange = (licenseId, field, value) => {
    const updatedLicenses = {
      ...formData.licenses,
      [licenseId]: {
        ...formData.licenses[licenseId],
        [field]: value
      }
    };
    updateFormData('licenses', updatedLicenses);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* 1. INFORMACIÓN TÉCNICA (Grid de 2) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BPM */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">BPM (Tempo)</label>
          <div className="relative">
            <input
              type="number"
              value={formData.bpm}
              onChange={(e) => updateFormData('bpm', e.target.value)}
              placeholder="Ej: 140"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-white outline-none focus:border-violet-500 transition"
            />
            <Hash size={18} className="absolute left-3 top-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Key (Tonalidad) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Key (Tonalidad)</label>
          <select
            value={formData.key}
            onChange={(e) => updateFormData('key', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition appearance-none"
          >
            {MUSIC_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </section>

      {/* 2. TAGS (Sistema de Píldoras) */}
      <section className="space-y-2">
        <label className="text-sm font-medium text-gray-400 flex justify-between">
          <span>Tags (Género, Vibe)</span>
          <span className="text-xs text-gray-500">{formData.tags.length}/5</span>
        </label>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-violet-500 transition">
          <Tag size={18} className="text-zinc-500 ml-1" />
          
          {formData.tags.map(tag => (
            <span key={tag} className="bg-violet-500/20 text-violet-300 text-sm px-3 py-1 rounded-full flex items-center gap-1">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-white"><small>✕</small></button>
            </span>
          ))}

          <input
            type="text"
            onKeyDown={handleTagKeyDown}
            placeholder={formData.tags.length < 5 ? "Escribe y presiona Enter..." : ""}
            disabled={formData.tags.length >= 5}
            className="bg-transparent border-none outline-none text-white flex-1 min-w-[120px]"
          />
        </div>
      </section>

      {/* 3. VISIBILIDAD Y FECHA */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Fecha de Lanzamiento</label>
          <div className="relative">
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) => updateFormData('releaseDate', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-white outline-none focus:border-violet-500 transition [color-scheme:dark]"
            />
            <Calendar size={18} className="absolute left-3 top-3.5 text-zinc-500" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Visibilidad</label>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'public', label: 'Público', icon: Globe },
              { id: 'unlisted', label: 'Oculto', icon: EyeOff },
              { id: 'private', label: 'Privado', icon: Lock },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateFormData('visibility', opt.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition
                  ${formData.visibility === opt.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-white/10" />

      {/* 4. PRECIOS Y LICENCIAS (Dinámico) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Precios de Licencias</h3>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={formData.isFree} 
              onChange={(e) => updateFormData('isFree', e.target.checked)}
              className="accent-violet-500 w-4 h-4"
            />
            <span className="text-sm text-gray-400">Habilitar descarga gratuita (Tagged MP3)</span>
          </div>
        </div>

        <div className="grid gap-4">
          {Object.entries(formData.licenses).map(([key, license]) => (
            <div 
              key={key} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all
                ${license.enabled 
                  ? 'bg-zinc-900/80 border-violet-500/30 shadow-lg shadow-violet-900/5' 
                  : 'bg-zinc-900/30 border-zinc-800 opacity-60'}`}
            >
              {/* Toggle + Nombre */}
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => handleLicenseChange(key, 'enabled', !license.enabled)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${license.enabled ? 'bg-violet-600' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${license.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="font-semibold text-white capitalize">{license.name}</p>
                  <p className="text-xs text-gray-500">MP3, WAV, Stems...</p>
                </div>
              </div>

              {/* Input de Precio */}
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  disabled={!license.enabled}
                  value={license.price}
                  onChange={(e) => handleLicenseChange(key, 'price', e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg py-2 pl-7 pr-3 text-right text-white font-mono focus:border-violet-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OFERTAS / DESCUENTOS */}
      <section className="bg-gradient-to-r from-violet-900/10 to-transparent p-5 rounded-2xl border border-violet-500/20">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
               <Percent size={20} />
             </div>
             <div>
               <p className="font-medium text-white">Descuento de Lanzamiento</p>
               <p className="text-xs text-gray-400">Aplica para todas las licencias</p>
             </div>
          </div>

          <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
             <input 
               type="number" 
               placeholder="0"
               value={formData.discountAmount || ''}
               onChange={(e) => updateFormData('discountAmount', e.target.value)}
               className="bg-transparent text-white w-20 text-center outline-none border-r border-white/10"
             />
             <select 
               value={formData.discountType}
               onChange={(e) => updateFormData('discountType', e.target.value)}
               className="bg-transparent text-gray-400 text-sm outline-none cursor-pointer hover:text-white"
             >
               <option value="percent">% OFF</option>
               <option value="fixed">$ OFF</option>
             </select>
          </div>
        </div>
      </section>

    </div>
  );
}