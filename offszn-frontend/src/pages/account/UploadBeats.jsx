import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../store/authStore"; // Ajusta según tu estructura
import { useBeatUpload } from '../../hooks/useBeatUpload'; // El hook que definimos antes
import { PublishOverlay, DraftSavedModal, FirstTimeModal, ExitConfirmModal } from '../../components/UploadModals'; // Los componentes de modales
import { Save, X, ChevronRight, ChevronLeft, UploadCloud } from 'lucide-react'; // Iconos

// Componentes de los pasos (Los crearás con el contenido de los inputs del HTML antiguo)
import UploadStep1Files from './steps/UploadStep1Files';
import UploadStep2Metadata from './steps/UploadStep2Metadata';
import UploadStep3Review from './steps/UploadStep3Review';

const DEFAULT_LICENSES = {
  basic: { enabled: true, price: 29.95, name: 'Basic License' },
  premium: { enabled: true, price: 49.95, name: 'Premium License' },
  unlimited: { enabled: true, price: 99.95, name: 'Unlimited License' }
};

export default function UploadBeats() {
  const { user } = useAuth();
  const { handleSaveProduct, isPublishing, uploadProgress } = useBeatUpload();

  // --- ESTADO GLOBAL DEL FORMULARIO ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    key: 'Cm',
    releaseDate: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: [],
    description: '',
    // Archivos
    files: { cover: null, mp3: null, wav: null, stems: null },
    // Precios y Licencias
    licenses: DEFAULT_LICENSES,
    discountAmount: 0,
    discountType: 'percent', // 'percent' | 'fixed'
    isFree: false,
    // Colaboradores
    collaborators: []
  });

  // --- ESTADO DE MODALES ---
  const [modals, setModals] = useState({
    exitConfirm: false,
    draftSaved: false,
    firstTime: false,
    publishOverlay: false
  });

  // --- EFECTOS ---
  
  // 1. Detectar intento de cierre de pestaña si hay cambios
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. Mostrar tutorial si es primera vez
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('offszn_upload_tutorial');
    if (!hasSeenTutorial) {
      setModals(m => ({ ...m, firstTime: true }));
    }
  }, []);

  // --- HANDLERS ---

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const toggleModal = (modalName, show) => {
    setModals(prev => ({ ...prev, [modalName]: show }));
  };

  // Validación básica antes de cambiar de paso
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.title) return false; // Añadir más validaciones de archivos aquí
      return true;
    }
    if (currentStep === 2) {
      if (!formData.bpm || formData.bpm <= 0) return false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) setCurrentStep(p => Math.min(p + 1, 3));
    else alert("Por favor completa los campos requeridos."); // Reemplazar con Toast
  };

  const handleBack = () => setCurrentStep(p => Math.max(p - 1, 1));

  // --- PUBLICACIÓN / GUARDADO ---

  const onPublish = async (isDraft = false) => {
    // Activar Overlay
    toggleModal('publishOverlay', true);
    
    const result = await handleSaveProduct(
      { // Objetos de archivo (File objects)
        coverFile: formData.files.cover,
        mp3File: formData.files.mp3,
        wavFile: formData.files.wav,
        stemsFile: formData.files.stems,
      }, 
      formData, // Resto de datos
      isDraft
    );

    // Desactivar Overlay manejado por el hook, pero aseguramos UI
    if (result.success) {
      setIsDirty(false);
      toggleModal('publishOverlay', false);
      
      if (isDraft) {
        toggleModal('draftSaved', true);
      } else {
        // Redirigir a success o mis kits
        window.location.href = '/cuenta/mis-kits'; 
      }
    } else {
      toggleModal('publishOverlay', false);
      alert('Error: ' + result.error);
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      
      {/* 1. HEADER (Botones de Salida y Guardado Rápido) */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => isDirty ? toggleModal('exitConfirm', true) : window.history.back()}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">
            {isDirty ? 'Editando Nuevo Beat' : 'Nuevo Beat'}
          </h1>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onPublish(true)}
            disabled={isPublishing}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/5 text-sm font-medium transition disabled:opacity-50"
          >
            <Save size={16} />
            <span>Guardar Borrador</span>
          </button>
        </div>
      </header>

      {/* 2. STEPPER */}
      <div className="max-w-4xl mx-auto mt-8 px-6 mb-10">
        <div className="flex justify-between relative">
          {/* Línea de fondo */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 transform -translate-y-1/2"></div>
          
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center gap-2 bg-black px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                  ${currentStep >= step 
                    ? 'border-violet-500 bg-violet-500 text-white' 
                    : 'border-white/20 bg-black text-gray-500'}`}
              >
                {step}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step ? 'text-white' : 'text-gray-600'}`}>
                {step === 1 ? 'Archivos' : step === 2 ? 'Detalles' : 'Revisar'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL (Formularios) */}
      <main className="max-w-4xl mx-auto px-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {currentStep === 1 && (
            <UploadStep1Files 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}

          {currentStep === 2 && (
            <UploadStep2Metadata 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}

          {currentStep === 3 && (
            <UploadStep3Review 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
          
        </div>
      </main>

      {/* 4. FOOTER DE NAVEGACIÓN */}
      <footer className="fixed bottom-0 left-0 w-full bg-black border-t border-white/10 p-4 z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          {/* Botón Atrás */}
          <button 
            onClick={handleBack}
            disabled={currentStep === 1 || isPublishing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition
              ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft size={18} />
            Atrás
          </button>

          {/* Botón Siguiente / Publicar */}
          {currentStep < 3 ? (
            <button 
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onPublish(false)}
              disabled={isPublishing}
              className="btn-primary flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publicando...' : 'Publicar Beat'}
              {!isPublishing && <UploadCloud size={18} />}
            </button>
          )}

        </div>
      </footer>

      {/* 5. MODALES */}
      <PublishOverlay isVisible={isPublishing || modals.publishOverlay} message={uploadProgress.message} />
      
      <DraftSavedModal 
        isOpen={modals.draftSaved} 
        onClose={() => toggleModal('draftSaved', false)}
        onExit={() => window.location.href = '/cuenta/mis-kits'} 
      />

      <ExitConfirmModal
        isOpen={modals.exitConfirm}
        onClose={() => toggleModal('exitConfirm', false)}
        onSaveAndExit={() => onPublish(true)}
        onExitWithoutSave={() => {
          setIsDirty(false); // Evitar loop del useEffect
          window.history.back();
        }}
      />

      <FirstTimeModal 
        isOpen={modals.firstTime}
        onClose={() => {
          localStorage.setItem('offszn_upload_tutorial', 'true');
          toggleModal('firstTime', false);
        }}
      />

    </div>
  );
}


