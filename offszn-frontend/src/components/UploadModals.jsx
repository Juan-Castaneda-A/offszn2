import React from 'react';
import { X } from 'lucide-react'; // Asumiendo que usas Lucide para iconos, o el SVG directo

export const PublishOverlay = ({ isVisible, message }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-white/10 border-l-violet-500 rounded-full animate-spin mb-6"></div>
      <h3 className="text-2xl font-bold text-white mb-2">{message || 'Cargando...'}</h3>
      <p className="text-gray-400 font-medium">Por favor, no cierres esta página.</p>
    </div>
  );
};

export const DraftSavedModal = ({ isOpen, onClose, onExit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Borrador Guardado</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-400 mb-6">Tu progreso ha sido guardado</p>
          <div className="flex flex-col gap-3">
            <button onClick={onExit} className="btn-primary w-full justify-center">
              Ir a Mis Kits
            </button>
            <button onClick={onClose} className="btn-secondary w-full justify-center">
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
    <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Bienvenido a OFFSZN Upload</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 text-center">
            {/* ... Contenido del tutorial ... */}
            <p className="text-gray-400 mb-6">¿Primera vez? Te guiaremos paso a paso.</p>
            <div className="flex gap-4 justify-center">
                 <button onClick={onClose} className="btn-primary">¡Entendido!</button>
            </div>
        </div>
      </div>
    </div>
  );
};