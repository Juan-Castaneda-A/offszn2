import React, { useState } from 'react';
import { supabase } from '../../api/client';
import { toast } from 'react-hot-toast';

const TemplateSelector = ({ user, currentTemplate, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const handleSelect = async (templateId) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ template: templateId })
                .eq('id', user.id);

            if (error) throw error;
            
            toast.success(`Plantilla "${templateId}" activada`);
            if (onUpdate) onUpdate(templateId);
            
        } catch (error) {
            console.error(error);
            toast.error('Error al cambiar plantilla');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Diseño del Perfil</h3>
            <div className="grid grid-cols-3 gap-4">
                {['original', 'minimal', 'dark-neon'].map((tpl) => (
                    <button
                        key={tpl}
                        onClick={() => handleSelect(tpl)}
                        disabled={loading}
                        className={`
                            p-4 rounded-lg border text-sm font-bold capitalize transition
                            ${currentTemplate === tpl 
                                ? 'border-violet-500 bg-violet-500/10 text-white' 
                                : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-600'}
                        `}
                    >
                        {tpl}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;