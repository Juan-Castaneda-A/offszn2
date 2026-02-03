import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore, supabase } from '../../store/authStore';

const UpdatePassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { updatePassword } = useAuthStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isValidSession, setIsValidSession] = useState(true);

  // Verificar si hay sesión (el link mágico de Supabase loguea al usuario temporalmente)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setIsValidSession(false);
    });
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    try {
      await updatePassword(data.password);
      setMessage({ type: 'success', text: '¡Contraseña actualizada! Redirigiendo...' });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="text-center">
        <h1 className="text-white text-2xl font-semibold mb-2">Enlace no válido</h1>
        <p className="text-zinc-400 text-sm mb-6">El enlace ha expirado o no tienes permisos.</p>
        <button onClick={() => navigate('/auth/login')} className="px-6 py-2 bg-white text-black rounded-lg font-bold">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-semibold mb-2 font-display">Nueva Contraseña</h1>
        <p className="text-zinc-400 text-sm">Asegúrate de que sea segura.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-2 font-medium">Nueva Contraseña</label>
          <div className="relative">
            <input 
              {...register("password", { 
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" }
              })}
              type={showPassword ? "text" : "password"} 
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/50 transition-all pr-12 font-sans"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <span className="text-red-500 text-xs mt-2 block font-medium">{errors.password.message}</span>}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center font-display"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Actualizar Contraseña"}
        </button>
      </form>
    </>
  );
};

export default UpdatePassword;