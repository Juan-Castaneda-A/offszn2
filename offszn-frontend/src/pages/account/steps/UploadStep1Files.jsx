import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, Music, Package, X, FileAudio } from 'lucide-react';

export default function UploadStep1Files({ formData, updateFormData }) {

  // --- LÓGICA DE MANEJO DE ARCHIVOS ---
  
  const handleFileChange = (key, file) => {
    if (!file) return;

    // Actualizamos el objeto 'files' dentro de formData
    const newFiles = { ...formData.files, [key]: file };
    updateFormData('files', newFiles);

    // Si es la portada, generamos una URL temporal para previsualizarla
    if (key === 'cover') {
      const previewUrl = URL.createObjectURL(file);
      updateFormData('coverPreview', previewUrl); // Guardamos esto solo para verla ahora
    }
  };

  // Helper para Drag & Drop
  const onDrop = useCallback((e, key) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(key, file);
  }, []);

  const onDragOver = (e) => e.preventDefault();

  // Componente Reutilizable para Zonas de Carga (Para no repetir código HTML)
  const UploadZone = ({ label, fileKey, accept, icon: Icon, currentFile }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-400 ml-1">{label}</span>
      
      <div 
        onDrop={(e) => onDrop(e, fileKey)}
        onDragOver={onDragOver}
        className={`
          relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${currentFile 
            ? 'border-violet-500/50 bg-violet-500/5' 
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}
        `}
      >
        <input 
          type="file" 
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => handleFileChange(fileKey, e.target.files[0])}
        />

        <div className="flex flex-col items-center justify-center text-center gap-3">
          {currentFile ? (
            <>
              <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white max-w-[200px] truncate">
                  {currentFile.name}
                </span>
                <span className="text-xs text-violet-400">Archivo listo</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que abra el selector de archivos
                  e.preventDefault();
                  const newFiles = { ...formData.files, [fileKey]: null };
                  updateFormData('files', newFiles);
                }}
                className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white z-20"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-300 group-hover:text-white transition">
                  Arrastra o selecciona
                </span>
                <span className="text-xs text-gray-600">
                  {accept === 'image/*' ? 'JPG, PNG (Max 5MB)' : 'WAV, MP3, ZIP'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* 1. Título del Beat */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 ml-1">Título del Track <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Ej: Dark Trap Banger (Prod. You)"
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition text-lg"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Columna Izquierda: Portada (Cover Art) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-sm font-medium text-gray-400 ml-1">Portada (Cover)</span>
          <div 
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border-2 border-dashed border-zinc-800 group hover:border-zinc-600 transition"
          >
            {formData.coverPreview ? (
              <>
                <img 
                  src={formData.coverPreview} 
                  alt="Cover Preview" 
                  className="w-full h-full object-cover"
                />
                {/* Botón cambiar imagen */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition backdrop-blur-sm">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <ImageIcon size={16} /> Cambiar
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <ImageIcon size={32} />
                <span className="text-sm">Subir Imagen</span>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => handleFileChange('cover', e.target.files[0])}
            />
          </div>
          <p className="text-xs text-center text-gray-600 mt-2">Recomendado: 3000x3000px</p>
        </div>

        {/* 3. Columna Derecha: Archivos de Audio */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* MP3 Tagged */}
          <UploadZone 
            label="MP3 con Tags (Para escuchar gratis)" 
            fileKey="mp3" 
            accept=".mp3" 
            icon={Music} 
            currentFile={formData.files.mp3}
          />

          {/* WAV Untagged */}
          <UploadZone 
            label="WAV Sin Tags (Para cliente)" 
            fileKey="wav" 
            accept=".wav" 
            icon={FileAudio} 
            currentFile={formData.files.wav}
          />

          {/* Stems */}
          <UploadZone 
            label="Stems / Trackout (Opcional .zip)" 
            fileKey="stems" 
            accept=".zip,.rar" 
            icon={Package} 
            currentFile={formData.files.stems}
          />
          
        </div>
      </div>
    </div>
  );
}