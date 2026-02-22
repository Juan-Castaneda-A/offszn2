import React, { useState, useEffect } from 'react';
import { supabase } from "../../api/client";
import {
  Save,
  Camera,
  User,
  Mail,
  MapPin,
  Lock,
  Check,
  AlertCircle,
  Loader2,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Globe,
  Instagram,
  Twitter,
  Music
} from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-violet-500" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Sincronizando identidad digital...</span>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Hero Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">ID Card</span>
          </div>
          <div className="h-px w-8 bg-white/5"></div>
        </div>
        <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Mi <span className="text-violet-500">Perfil</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
          <ShieldCheck size={12} className="text-violet-500" /> Administra tu información personal y presencia pública en OFFSZN
        </p>
      </div>

      {/* FEEDBACK SNACKBAR */}
      {message && (
        <div className={`fixed top-10 right-10 z-[100] p-5 rounded-[24px] border border-white/10 backdrop-blur-2xl flex items-center gap-4 animate-in slide-in-from-right-8 duration-500 shadow-2xl ${message.type === 'success'
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-red-500/10 text-red-400'
          }`}>
          <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 mb-20">

        {/* --- LEFT COL: AVATAR & QUICK LINKS --- */}
        <div className="space-y-8">
          <div className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[48px] flex flex-col items-center text-center group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
              <User size={160} />
            </div>

            <div className="relative group/avatar cursor-pointer mb-8">
              <div className="w-40 h-40 rounded-[60px] overflow-hidden border-4 border-white/5 group-hover/avatar:border-violet-500 transition-all duration-700 shadow-2xl bg-black">
                {(avatarPreview || formData.avatarUrl) ? (
                  <img
                    src={avatarPreview || formData.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800 bg-white/[0.02]">
                    <User size={64} />
                  </div>
                )}
              </div>

              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 rounded-[60px] cursor-pointer backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="text-white text-2xl animate-bounce" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Photo</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">{formData.nickname || 'Usuario'}</h3>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Mail size={12} className="text-violet-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest lowercase">{formData.email}</span>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden p-3 space-y-1">
            <SidebarButton icon={Lock} label="Seguridad & Privacidad" />
            <SidebarButton icon={CreditCard} label="Plan de Membresía" badge="Basic" />
            <SidebarButton icon={LogOut} label="Cerrar Sesión" color="text-red-500 underline-offset-4 hover:underline" />
          </div>
        </div>

        {/* --- RIGHT COL: FORMULARIO --- */}
        <div className="space-y-10">

          <div className="p-12 bg-[#0A0A0A] border border-white/5 rounded-[60px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
              <Sparkles size={200} />
            </div>

            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-[20px] bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                <User size={20} />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-white">Información Pública</h4>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cómo te verán otros miembros de la comunidad</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <InputGroup label="Nombre Real" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ej. Juan" icon={<User size={16} />} />
              <InputGroup label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ej. Pérez" icon={<User size={16} />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <InputGroup label="Alias / Producer Name" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Ej. Metro Boomin" icon={<Music size={16} />} />
              <InputGroup label="Ubicación" name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Medellín, CO" icon={<MapPin size={16} />} />
            </div>

            <div className="mb-12">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-1">Semblanza Profesional (Bio)</label>
              <div className="relative group">
                <textarea
                  name="bio"
                  rows="5"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Escribe algo sobre tu trayectoria, equipo o influencias musicales..."
                  className="w-full bg-black border border-white/5 rounded-[24px] px-8 py-6 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder-gray-800 resize-none font-medium leading-relaxed"
                ></textarea>
                <div className="absolute bottom-6 right-8 text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
                  {formData.bio.length} <span className="opacity-40">/ 300</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-white/5">
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-4 px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-violet-500 hover:text-white transition-all shadow-2xl disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} className="group-hover:rotate-12 transition-transform" />
                )}
                <span className="tracking-[0.2em]">{saving ? 'Procesando...' : 'Guardar Perfil'}</span>
              </button>
            </div>
          </div>

          {/* Social Panel */}
          <div className="p-12 bg-[#0A0A0A] border border-white/5 rounded-[60px] relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter text-white">Social Hub</h4>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Vincula tus plataformas externas</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-white/5 text-gray-500 px-4 py-1.5 rounded-full border border-white/5 tracking-[0.2em]">BETA ACCESS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 blur-[1px] select-none pointer-events-none">
              <div className="flex items-center gap-4 p-6 bg-black border border-white/5 rounded-[32px]">
                <Instagram size={20} className="text-pink-500" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Instagram</span>
              </div>
              <div className="flex items-center gap-4 p-6 bg-black border border-white/5 rounded-[32px]">
                <Twitter size={20} className="text-blue-500" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Twitter / X</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-violet-500/5 border border-violet-500/10 rounded-[32px] text-center">
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">La vinculación de redes sociales estará disponible próximamente para perfiles verificados.</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// Componente auxiliar para Botones del Sidebar
function SidebarButton({ icon: Icon, label, color, badge }) {
  return (
    <button type="button" className={`w-full flex items-center justify-between p-6 transition-all outline-none rounded-[28px] group hover:bg-white/[0.03] ${color || 'text-gray-500 hover:text-white'}`}>
      <div className="flex items-center gap-4">
        <Icon size={18} className="group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      {badge ? (
        <span className="text-[9px] font-black bg-violet-500/10 text-violet-500 px-3 py-1.5 rounded-[12px] border border-violet-500/20 shadow-lg shadow-violet-500/10">{badge}</span>
      ) : (
        <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
}

// Componente auxiliar para Inputs
function InputGroup({ label, name, value, onChange, placeholder, icon, type = "text" }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{label}</label>
      <div className="relative group">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-black border border-white/5 rounded-[24px] px-8 py-6 pl-16 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder-gray-800 font-bold"
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-violet-500 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}
