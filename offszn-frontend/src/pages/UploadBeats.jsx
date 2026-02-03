import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; // Asumo que ya tienes supabase instalado
import '../styles/UploadBeat.css'; // Importamos tus estilos

// Configura tu cliente de Supabase (o impórtalo desde un archivo de configuración)
const supabaseUrl = "TU_SUPABASE_URL";
const supabaseKey = "TU_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

const UploadBeat = () => {
  const [step, setStep] = useState(1);
  
  // Estado para la data del formulario
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    key: '',
    description: '',
    visibility: 'public',
    tags: []
  });

  // Estado para los archivos (solo guardamos el objeto File por ahora)
  const [files, setFiles] = useState({
    cover: null,
    mp3Tagged: null,
    wavUntagged: null,
    stems: null
  });

  // Estado temporal para el input de tags
  const [tagInput, setTagInput] = useState('');

  // Referencias para simular clic en inputs ocultos
  const fileInputRefs = {
    cover: useRef(null),
    mp3Tagged: useRef(null),
    wavUntagged: useRef(null),
    stems: useRef(null)
  };

  // --- MANEJADORES DE EVENTOS ---

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Mapeamos los IDs de tu HTML a las propiedades del estado
    const map = {
      titleInput: 'title',
      bpmInput: 'bpm',
      descInput: 'description'
      // Agrega otros si es necesario
    };
    const key = map[id] || id;
    setFormData({ ...formData, [key]: value });
  };

  // Manejador de Archivos
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [type]: file });
      // Aquí luego agregaremos la lógica de subida a Supabase
      console.log(`Archivo seleccionado para ${type}:`, file.name);
    }
  };

  // Trigger para abrir el selector de archivos
  const triggerFileInput = (type) => {
    fileInputRefs[type].current.click();
  };

  // Manejo de Tags
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && formData.tags.length < 3) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
        setTagInput('');
      }
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  // --- RENDERIZADO ---

  return (
    <div className="upload-container-wrapper"> 
      {/* HEADER SIMPLIFICADO */}
      <div className="steps-container">
          <div className="steps-line"></div>
          <div className="steps-progress" style={{ width: step === 1 ? '0%' : '33%' }}></div>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`step ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
              {num}
            </div>
          ))}
      </div>

      <div className="main-content">
        {/* STEP 1: ARCHIVOS E INFO */}
        {step === 1 && (
          <div className="form-step active">
            <div className="grid-1-2">
              
              {/* IZQUIERDA: PORTADA */}
              <div>
                <div className="label">Portada <span className="required">*</span></div>
                <div 
                  className={`cover-upload ${files.cover ? 'has-image' : ''}`} 
                  onClick={() => triggerFileInput('cover')}
                >
                  <input 
                    type="file" 
                    ref={fileInputRefs.cover} 
                    onChange={(e) => handleFileChange(e, 'cover')} 
                    accept="image/*" 
                    hidden 
                  />
                  {files.cover ? (
                    <img src={URL.createObjectURL(files.cover)} className="cover-preview" style={{display:'block'}} alt="Preview"/>
                  ) : (
                    <div className="cover-placeholder">
                      <div className="upload-subtext">Click para subir</div>
                    </div>
                  )}
                </div>
              </div>

              {/* DERECHA: ARCHIVOS DE AUDIO */}
              <div className="file-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '29px' }}>
                
                {/* 1. MP3 TAGGED */}
                <div className="upload-zone horizontal-upload" onClick={() => triggerFileInput('mp3Tagged')}>
                   <div className="slot-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', marginRight: '16px' }}>
                      <span>MP3</span>
                   </div>
                   <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>BEAT MP3</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>{files.mp3Tagged ? files.mp3Tagged.name : '(Con Tag)'}</div>
                   </div>
                   <input type="file" ref={fileInputRefs.mp3Tagged} onChange={(e) => handleFileChange(e, 'mp3Tagged')} accept=".mp3" hidden />
                </div>

                {/* 2. WAV UNTAGGED */}
                <div className="upload-zone horizontal-upload" onClick={() => triggerFileInput('wavUntagged')}>
                   <div className="slot-icon" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', marginRight: '16px' }}>
                      <span>WAV</span>
                   </div>
                   <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>BEAT WAV</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>{files.wavUntagged ? files.wavUntagged.name : '(Sin Tag)'}</div>
                   </div>
                   <input type="file" ref={fileInputRefs.wavUntagged} onChange={(e) => handleFileChange(e, 'wavUntagged')} accept=".wav" hidden />
                </div>

                 {/* TÍTULO */}
                 <div className="form-group" style={{marginTop: '20px'}}>
                    <div className="label">Título <span className="required">*</span></div>
                    <input 
                      type="text" 
                      id="titleInput"
                      className="input-field" 
                      placeholder="Ej: offszn 140bpm Cm"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                 </div>

                 {/* TAGS */}
                 <div className="form-group">
                    <div className="label">Tags (Enter para agregar)</div>
                    <div className="tags-container">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-chip">
                          {tag} <span onClick={() => removeTag(index)} className="tag-remove">×</span>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        className="tags-input" 
                        placeholder="Trap, Dark..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </div>
                 </div>

              </div>
            </div>
            
            {/* BOTÓN SIGUIENTE (Temporal) */}
            <button 
              className="btn btn-primary" 
              style={{marginTop: '30px', width: '100%'}} 
              onClick={() => setStep(2)}
            >
              Siguiente Paso
            </button>
          </div>
        )}

        {/* AQUÍ IRÍAN LOS PASOS 2, 3 y 4 */}
        {step === 2 && <div><h2>Paso 2: Detalles y Precio (En construcción)</h2></div>}
      </div>
    </div>
  );
};

export default UploadBeat;