import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const COOLDOWN_SECONDS = 60;

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { resetPassword } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [cooldown, setCooldown] = useState(0);

  // Verificar cooldown al cargar
  useEffect(() => {
    const lastRequest = localStorage.getItem('lastResetRequest');
    if (lastRequest) {
      const elapsed = (Date.now() - parseInt(lastRequest)) / 1000;
      if (elapsed < COOLDOWN_SECONDS) {
        setCooldown(Math.ceil(COOLDOWN_SECONDS - elapsed));
      } else {
        localStorage.removeItem('lastResetRequest');
      }
    }
  }, []);

  // Timer del cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const onSubmit = async (data) => {
    if (cooldown > 0) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await resetPassword(data.email);
      setMessage({ type: 'success', text: '¡Enlace enviado! Revisa tu correo.' });
      
      // Activar cooldown
      localStorage.setItem('lastResetRequest', Date.now().toString());
      setCooldown(COOLDOWN_SECONDS);
      
    } catch (error) {
      // Manejo de error específico de "Too many requests"
      if (error.message.includes("Too many requests") || error.status === 429) {
        setMessage({ type: 'error', text: 'Demasiados intentos. Espera unos segundos.' });
        setCooldown(COOLDOWN_SECONDS); // Forzar cooldown
      } else {
        setMessage({ type: 'error', text: 'Error al enviar enlace. Verifica el correo.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-semibold mb-2 font-display">Recuperar Contraseña</h1>
        <p className="text-zinc-400 text-sm">Ingresa tu correo y te enviaremos un enlace.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-2 font-medium">Correo electrónico</label>
          <input 
            {...register("email", { required: "El correo es obligatorio" })}
            type="email" 
            placeholder="tu@email.com"
            disabled={cooldown > 0}
            className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/50 transition-all font-sans disabled:opacity-50"
          />
          {errors.email && <span className="text-red-500 text-xs mt-2 block font-medium">{errors.email.message}</span>}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || cooldown > 0}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center font-display disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
           cooldown > 0 ? `Reenviar en ${cooldown}s` : "Enviar enlace de recuperación"}
        </button>
      </form>

      <p className="text-center text-zinc-400 text-sm mt-6">
        <Link to="/auth/login" className="text-white hover:underline flex items-center justify-center gap-2">
           ← Volver al Login
        </Link>
      </p>
    </>
  );
};

export default ForgotPassword;