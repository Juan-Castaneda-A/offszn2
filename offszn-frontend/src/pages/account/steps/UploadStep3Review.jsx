import React from 'react';
import { CheckCircle2, Music, DollarSign, Tag, Info, AlertCircle } from 'lucide-react';

export default function UploadStep3Review({ formData }) {
  
  // Calcular el precio más bajo para mostrar en la previsualización
  const activePrices = Object.values(formData.licenses)
    .filter(l => l.enabled)
    .map(l => parseFloat(l.price) || 0);
  
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-10">
      
      {/* 1. MENSAJE DE ÉXITO PREVIO */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-2 bg-violet-500/20 rounded-full text-violet-400">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">¡Todo listo para publicar!</h3>
          <p className="text-sm text-gray-400">Revisa que la información sea correcta. Podrás editarla más tarde si es necesario.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. PREVISUALIZACIÓN DE LA TARJETA (CÓMO SE VERÁ) */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider ml-1">Vista Previa en Tienda</h4>
          
          <div className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition hover:border-zinc-700 shadow-2xl">
            {/* Imagen de Portada */}
            <div className="aspect-square relative overflow-hidden">
              {formData.coverPreview ? (
                <img src={formData.coverPreview} alt="Preview" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                  <Music size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              
              {/* Badge de Precio */}
              <div className="absolute bottom-4 left-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
                ${minPrice.toFixed(2)}
              </div>
            </div>

            {/* Info del Beat */}
            <div className="p-5 space-y-2">
              <h3 className="text-xl font-bold text-white truncate">{formData.title || 'Título del Beat'}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{formData.bpm || '--'} BPM</span>
                <span>•</span>
                <span>{formData.key}</span>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest bg-zinc-800 text-gray-400 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. RESUMEN DE ARCHIVOS Y LICENCIAS */}
        <div className="space-y-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider ml-1">Resumen de Configuración</h4>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl divide-y divide-white/5">
            
            {/* Archivos Cargados */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music size={18} className="text-gray-500" />
                <span className="text-sm text-gray-300">Archivos de Audio</span>
              </div>
              <div className="flex gap-2">
                {formData.files.mp3 && <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded">MP3</span>}
                {formData.files.wav && <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded">WAV</span>}
                {formData.files.stems && <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded">ZIP</span>}
              </div>
            </div>

            {/* Licencias Activas */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <DollarSign size={18} className="text-gray-500" />
                <span className="text-sm text-gray-300">Licencias Habilitadas</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(formData.licenses).filter(l => l.enabled).map(l => (
                  <div key={l.name} className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400">{l.name}</span>
                    <span className="text-xs font-mono text-white">${parseFloat(l.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visibilidad */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-gray-500" />
                <span className="text-sm text-gray-300">Estado de Publicación</span>
              </div>
              <span className="text-xs font-medium text-violet-400 capitalize bg-violet-500/10 px-3 py-1 rounded-full">
                {formData.visibility}
              </span>
            </div>

          </div>

          {/* Advertencia de Seguridad */}
          <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-200/60 leading-relaxed">
              Al publicar este track, confirmas que posees el 100% de los derechos de autor o tienes las licencias necesarias para los samples utilizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}