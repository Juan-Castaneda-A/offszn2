import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

// --- TUS MODALES ORIGINALES ---

export const PublishOverlay = ({ isVisible, message }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-white/10 border-l-violet-500 rounded-full animate-spin mb-6"></div>
      <h3 className="text-2xl font-bold text-white mb-2">{message || 'Cargando...'}</h3>
      <p className="text-gray-400 font-medium">Por favor, no cierres esta página.</p>
    </div>
  );
};

export const DraftSavedModal = ({ isOpen, onClose, onExit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Borrador Guardado</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-400 mb-6">Tu progreso ha sido guardado</p>
          <div className="flex flex-col gap-3">
            <button onClick={onExit} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">
              Ir a Mis Kits
            </button>
            <button onClick={onClose} className="w-full py-3 bg-transparent border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition">
              Seguir Editando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FirstTimeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Bienvenido a OFFSZN Upload</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 text-center">
            <p className="text-gray-400 mb-6">¿Primera vez? Te guiaremos paso a paso.</p>
            <div className="flex gap-4 justify-center">
                 <button onClick={onClose} className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition">
                   ¡Entendido!
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- EL MODAL QUE FALTABA (Diseñado con tu estilo) ---

export const ExitConfirmModal = ({ isOpen, onClose, onSaveAndExit, onExitWithoutSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
        
        {/* Header con icono de alerta */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3 text-amber-500">
           <AlertTriangle size={20} />
           <h2 className="text-lg font-semibold text-white">¿Salir sin guardar?</h2>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Tienes cambios pendientes. Si sales ahora, <strong>perderás el progreso</strong> de este beat.
          </p>

          <div className="flex flex-col gap-3">
            {/* Botón Principal: Guardar */}
            <button 
              onClick={onSaveAndExit}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition"
            >
              Guardar y Salir
            </button>
            
            {/* Botón Secundario: Salir sin guardar */}
            <button 
              onClick={onExitWithoutSave}
              className="w-full py-3 bg-transparent border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition"
            >
              Salir sin guardar
            </button>
            
            {/* Botón Cancelar */}
            <button 
              onClick={onClose}
              className="mt-2 text-xs text-gray-500 hover:text-white transition"
            >
              Cancelar (Volver a editar)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};