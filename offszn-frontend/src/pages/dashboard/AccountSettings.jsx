import React, { useState, useEffect } from 'react';
import { supabase } from "../../api/client";
import { 
  BiSave, 
  BiCamera, 
  BiUser, 
  BiEnvelope, 
  BiMap, 
  BiLockAlt, 
  BiCheck,
  BiError
} from 'react-icons/bi';

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  
  // Estado del usuario y formulario
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '', // Read only
    location: '',
    bio: '',
    avatarUrl: ''
  });
  
  // Estado para la previsualización de imagen
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // --- CARGAR DATOS ---
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, nickname, location, bio, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            nickname: data.nickname || '',
            email: user.email,
            location: data.location || '',
            bio: data.bio || '',
            avatarUrl: data.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error cargando perfil:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  // --- MANEJADORES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- GUARDAR CAMBIOS ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let finalAvatarUrl = formData.avatarUrl;

      // 1. Subir imagen si existe nueva
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalAvatarUrl = publicUrl;
      }

      // 2. Actualizar tabla users
      const updates = {
        id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        nickname: formData.nickname,
        location: formData.location,
        bio: formData.bio,
        avatar_url: finalAvatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('users').upsert(updates);
      if (error) throw error;

      // Actualizar estado local
      setFormData(prev => ({ ...prev, avatarUrl: finalAvatarUrl }));
      setAvatarFile(null); // Resetear archivo pendiente
      showMessage('success', 'Perfil actualizado correctamente.');

    } catch (error) {
      console.error(error);
      showMessage('error', 'Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-[#666] animate-pulse">Cargando perfil...</div>;

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-jakarta text-white tracking-tight">Configuración de Cuenta</h1>
        <p className="text-[#888] text-sm mt-1">Administra tu información pública y privada.</p>
      </div>

      {/* FEEDBACK MESSAGE */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-[rgba(16,185,129,0.1)] border-emerald-500/30 text-emerald-400' 
            : 'bg-[rgba(239,68,68,0.1)] border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <BiCheckCircle size={20} /> : <BiErrorCircle size={20} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* --- LEFT COL: AVATAR --- */}
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl flex flex-col items-center text-center">
            
            <div className="relative group cursor-pointer mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#333] group-hover:border-[#8B5CF6] transition-all bg-[#111]">
                {(avatarPreview || formData.avatarUrl) ? (
                  <img 
                    src={avatarPreview || formData.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]">
                    <BiUser size={48} />
                  </div>
                )}
              </div>
              
              {/* Overlay de subida */}
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <BiCamera className="text-white text-2xl" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <h3 className="text-white font-semibold text-lg">{formData.nickname || 'Usuario'}</h3>
            <p className="text-[#666] text-xs mt-1">{formData.email}</p>
          </div>

          {/* Opciones Extra (Placeholder) */}
          <div className="p-5 bg-[rgba(15,15,15,0.6)] border border-[#1A1A1A] rounded-2xl space-y-3">
             <button type="button" className="w-full flex items-center gap-3 text-[#888] hover:text-white text-sm p-2 hover:bg-[#1A1A1A] rounded-lg transition-all text-left">
               <BiLockAlt /> Cambiar Contraseña
             </button>
             <button type="button" className="w-full flex items-center gap-3 text-red-400/70 hover:text-red-400 text-sm p-2 hover:bg-red-500/10 rounded-lg transition-all text-left">
               <BiError /> Cerrar Sesión
             </button>
          </div>
        </div>

        {/* --- RIGHT COL: FORMULARIO --- */}
        <div className="space-y-6">
          
          <div className="p-8 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl">
            <h4 className="text-lg font-semibold text-white mb-6 border-b border-[#222] pb-4">Información Básica</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputGroup label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ej. Juan" />
              <InputGroup label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ej. Pérez" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputGroup label="Nickname (Artist Name)" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Ej. Metro Boomin" icon={<BiUser />} />
              <InputGroup label="Ubicación" name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Medellín, CO" icon={<BiMap />} />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-[#888] mb-2 uppercase tracking-wide">Biografía</label>
              <textarea 
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Cuéntanos un poco sobre ti..."
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder-[#444] resize-none"
              ></textarea>
              <p className="text-[#444] text-xs mt-2 text-right">{formData.bio.length}/300 caracteres</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#222]">
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[#8B5CF6] text-white font-semibold rounded-xl hover:bg-[#7c3aed] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {saving ? (
                   <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Guardando...</>
                ) : (
                   <><BiSave /> Guardar Cambios</>
                )}
              </button>
            </div>
          </div>

          <div className="p-8 bg-[rgba(15,15,15,0.6)] backdrop-blur-xl border border-[#1A1A1A] rounded-2xl opacity-75 grayscale hover:grayscale-0 transition-all">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Configuración de Pagos</h4>
                <span className="text-[10px] bg-[#222] text-[#888] px-2 py-1 rounded border border-[#333]">PRÓXIMAMENTE</span>
             </div>
             <p className="text-sm text-[#666]">Aquí podrás conectar tu cuenta de Stripe para recibir pagos directamente.</p>
          </div>

        </div>
      </form>
    </div>
  );
}

// Componente auxiliar para Inputs
function InputGroup({ label, name, value, onChange, placeholder, icon, type = "text" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[#888] uppercase tracking-wide">{label}</label>
      <div className="relative group">
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder-[#444]"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#8B5CF6] transition-colors">
          {icon || <BiCheckCircle className="opacity-0" />} 
        </div>
      </div>
    </div>
  );
}