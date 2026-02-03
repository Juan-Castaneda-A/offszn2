import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleBack = () => {
    if (user) {
      // Si el usuario tiene nickname, ir a su perfil (ajustar lógica futura)
      // Por ahora al home o dashboard
      navigate('/'); 
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-white px-5 py-20">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-red-500 uppercase font-display tracking-tight">
        404 No Encontrado
      </h1>
      <p className="text-zinc-400 mb-8 text-lg max-w-md">
        La página que buscas no existe o ha sido movida a otra dimensión.
      </p>
      
      <button 
        onClick={handleBack}
        className="bg-white text-black border-none py-3 px-8 font-bold rounded-xl cursor-pointer text-base transition-transform hover:scale-105 font-display shadow-lg shadow-white/10"
      >
        VOLVER AL INICIO
      </button>
    </div>
  );
};

export default NotFound;