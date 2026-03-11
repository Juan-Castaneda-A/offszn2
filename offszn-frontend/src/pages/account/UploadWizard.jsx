import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../../store/uploadStore';
import { useAuth } from '../../store/authStore';
import { useBeatUpload } from '../../hooks/useBeatUpload';
import apiClient from '../../api/client';
import { useYouTubeSync } from '../../hooks/useYouTubeSync';
import { initGoogleAuth, requestAuthToken } from '../../utils/YouTubeUploader';
import { PublishOverlay } from '../../components/UploadModals';
import { X, Save } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

// New specialized steps
import Step1Details from './steps/Step1Details';
import Step2Files from './steps/Step2Files';
import Step3Pricing from './steps/Step3Pricing';
import Step4Review from './steps/Step4Review';
import TypeSelector from './steps/TypeSelector';

export default function UploadWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentStep, productType, title, tags, coverImage, files,
    nextStep, prevStep, resetForm, updateField,
    youtubeSync, youtubeStatus, youtubeProgress
  } = useUploadStore();

  const { handleSaveProduct, isPublishing, uploadProgress } = useBeatUpload();
  const { handleSync } = useYouTubeSync();

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null);

  // Determinar qué archivo usar para el player
  const previewFile = files.mp3_tagged || files.mp3_low || files.wav_untagged;

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.2)',
      progressColor: '#8b5cf6',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 3,
      responsive: true,
      height: 30,
      barRadius: 2,
    });

    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));
    wavesurferRef.current.on('ready', () => {
      setDuration(wavesurferRef.current.getDuration());
    });
    wavesurferRef.current.on('timeupdate', () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (wavesurferRef.current) {
      if (previewFile && (previewFile instanceof File || previewFile instanceof Blob)) {
        const url = URL.createObjectURL(previewFile);
        wavesurferRef.current.load(url).catch(e => {
          if (e?.name !== 'AbortError') console.error('Wavesurfer load error:', e);
        });
      } else {
        wavesurferRef.current.empty();
        setIsPlaying(false);
      }
    }
  }, [previewFile]);

  const togglePlay = () => {
    if (wavesurferRef.current && previewFile) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Confirmation on exit if form is partially filled
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (title || tags.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, tags]);

  // Initialize Google Auth script early to preserve user gesture on click
  useEffect(() => {
    // We load it unconditionally on mount so it's ready when/if the user decides to sync
    initGoogleAuth().catch(err => console.error("Early Google Auth init failed:", err));
  }, []);

  const handlePublish = async (isDraft = false) => {
    // Prepare files for the hook
    const fileObjects = {
      coverFile: coverImage?.file || null,
      mp3File: files.mp3_tagged,
      wavFile: files.wav_untagged,
      stemsFile: files.stems,
      zipFile: files.zip_file // New mapping for Kits/Presets
    };

    const formState = useUploadStore.getState();

    // Acquire YouTube Token EARLY (preserving user gesture)
    let ytToken = null;
    if (youtubeSync && !isDraft) {
      try {
        console.log('🎬 Starting Publish Flow with YouTube Sync...');
        useUploadStore.setState({ youtubeStatus: 'authorizing', youtubeProgress: 0 });

        // IMPORTANT: requestAuthToken MUST succeed here. If it's not ready, we wait a tiny bit
        // but not too much or we lose the gesture.
        ytToken = await requestAuthToken();

        console.log('🎫 YouTube Token acquired, proceeding with OFFSZN upload...');
        useUploadStore.setState({ youtubeStatus: 'idle' }); // Reset for OFFSZN stage
      } catch (err) {
        console.error("YouTube Auth failed:", err);
        useUploadStore.setState({ youtubeStatus: 'idle' });
        if (!confirm("Fallo la autorización de YouTube. ¿Quieres continuar publicando solo en OFFSZN?")) {
          return;
        }
      }
    }

    const result = await handleSaveProduct(fileObjects, formState, isDraft);

    if (result.success) {
      // Phase 20: YouTube Sync Logic
      if (youtubeSync && !isDraft && result.data?.[0]?.id) {
        try {
          await handleSync(result.data[0].id, ytToken);
        } catch (err) {
          console.error("YouTube Sync failed, but product was saved:", err);
          alert('Tu beat se publicó con éxito en OFFSZN, pero la sincronización con YouTube falló: ' + err.message);
        }
      }

      // --- Notify collaborators (fire from here to guarantee execution) ---
      const collabs = formState.collaborators || [];
      console.log('[UploadWizard] Collaborators to notify:', collabs);
      for (const collab of collabs) {
        if (!collab.id) continue;
        try {
          await apiClient.post('/notifications', {
            targetUserId: collab.id,
            type: 'collab_invite',
            message: `Has sido añadido como colaborador en '<strong>${formState.title}</strong>'.`,
            link: `/dashboard/collaborations`
          });
          console.log(`[UploadWizard] ✅ collab_invite sent to ${collab.nickname} (${collab.id})`);
        } catch (e) {
          console.warn(`[UploadWizard] ❌ Could not notify ${collab.nickname}:`, e.message);
        }
      }

      resetForm();
      navigate('/dashboard');
    } else {
      alert('Error al publicar: ' + result.error);
    }
  };

  const steps = [
    { id: 1, label: 'Detalles', component: <Step1Details /> },
    { id: 2, label: 'Archivos', component: <Step2Files /> },
    { id: 3, label: 'Distribución', component: <Step3Pricing /> },
    { id: 4, label: 'Revisión', component: <Step4Review /> },
  ];

  // Si estamos en el paso 0, solo mostrar el selector de tipo
  if (currentStep === 0) {
    return <TypeSelector />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-violet-500/30 flex flex-col">

      {/* --- HEADER MATCHING LEGACY HTML --- */}
      <header className="px-10 py-5 border-b border-[#2a2a2a] flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-[100]">
        <div className="text-2xl font-extrabold tracking-tight">Studio Pipeline</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePublish(true)}
            className="bg-transparent border border-[#333] text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-white/5"
          >
            Guardar Borrador
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 border border-[#333] rounded-full flex items-center justify-center text-white bg-transparent cursor-pointer transition-all hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1000px] mx-auto pt-10 px-5 pb-[140px]">

        {/* --- LEGACY STEP INDICATOR --- */}
        <div className="flex justify-center mb-12 relative w-full px-5">
          {/* Background Line */}
          <div className="absolute top-1/2 left-5 w-[calc(100%-40px)] h-[2px] bg-[#222] -translate-y-1/2 z-0"></div>

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-5 h-[3px] bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] -translate-y-1/2 z-10 transition-all duration-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === 1 ? '0px' : '40px'})` }}
          ></div>

          {/* Step Nodes */}
          {steps.map((s, index) => {
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;

            return (
              <div
                key={s.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative z-20 mx-10 transition-all duration-300 cursor-pointer
                  ${isActive || isCompleted
                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-[0_4px_16px_rgba(139,92,246,0.5)]'
                    : 'bg-black border-2 border-[#222] text-[#888]'}`}
                onClick={() => {
                  if (s.id < currentStep) useUploadStore.setState({ currentStep: s.id });
                }}
              >
                {/* Check or Number */}
                {isCompleted ? <i className="bi bi-check-lg text-lg"></i> : s.id}

                {/* Step Label */}
                <span className={`absolute top-[50px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium transition-colors duration-300
                  ${isActive || isCompleted ? 'text-white' : 'text-[#888]'}`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* --- STEP CONTENT --- */}
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-forwards mt-10">
          {steps.find(s => s.id === currentStep)?.component}
        </div>
      </main>

      {/* --- LEGACY FIXED FOOTER --- */}
      <footer className="fixed bottom-0 left-0 right-0 h-auto sm:h-[80px] bg-[#0a0a0a] border-t border-[#222] z-[100] px-5 sm:px-10 py-4 sm:py-0 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">

        {/* Navigation Left */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={prevStep}
            disabled={isPublishing || currentStep === 1}
            className={`bg-transparent border-none text-[#888] font-semibold text-sm cursor-pointer px-4 py-2 hover:text-white transition-colors flex items-center gap-2
                ${currentStep === 1 ? 'pointer-events-none opacity-0' : ''}`}
          >
            <i className="bi bi-chevron-left"></i> Atrás
          </button>
        </div>

        {/* Player Center (Minimalist) */}
        <div className="flex-2 flex items-center max-w-[500px] w-full mx-5 gap-4">
          <button
            onClick={togglePlay}
            disabled={!previewFile}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none shadow-lg shrink-0 transition-transform hover:scale-105 active:scale-95
                ${previewFile
                ? 'bg-white text-black cursor-pointer'
                : 'bg-[#222] text-[#666] cursor-not-allowed'}`}
          >
            <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xl ${!isPlaying ? 'ml-1' : ''}`}></i>
          </button>
          <div className="flex-1 w-full" ref={waveformRef}></div>
          <span className="text-[#888] text-xs font-medium tabular-nums min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Navigation Right */}
        <div className="flex-1 flex justify-end">
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="bg-white text-black border-none px-6 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-transform hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              Siguiente <i className="bi bi-chevron-right text-xs"></i>
            </button>
          ) : (
            <button
              onClick={() => handlePublish(false)}
              disabled={isPublishing || youtubeStatus === 'authorizing'}
              className="bg-[#8b5cf6] text-white border-none px-8 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-transform hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(139,92,246,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              {isPublishing || youtubeStatus === 'authorizing' ? 'Publicando...' : 'Publicar Ahora'}
            </button>
          )}
        </div>
      </footer>

      {/* STATUS OVERLAYS */}
      <PublishOverlay
        isVisible={isPublishing || ['authorizing', 'rendering', 'uploading'].includes(youtubeStatus)}
        message={
          youtubeStatus === 'authorizing' ? 'Esperando Autorización de Google' :
            youtubeStatus === 'rendering' ? 'Renderizando Video' :
              youtubeStatus === 'uploading' ? 'Sincronizando YouTube' :
                uploadProgress.message
        }
        progress={youtubeStatus !== 'idle' ? youtubeProgress : uploadProgress.progress}
        subMessage={
          youtubeStatus === 'authorizing' ? 'Por favor, acepta el permiso en la ventana emergente.' :
            youtubeStatus === 'rendering' || youtubeStatus === 'uploading' ? 'Procesando visualizer 1080p, por favor espera.' :
              ''
        }
      />

    </div>
  );
}
