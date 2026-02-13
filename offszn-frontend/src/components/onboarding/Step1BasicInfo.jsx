import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/client';

const Step1BasicInfo = ({ onNext, initialData }) => {
    const [nickname, setNickname] = useState(initialData.nickname || '');
    const [firstName, setFirstName] = useState(initialData.firstName || '');
    const [lastName, setLastName] = useState(initialData.lastName || '');

    const [nicknameStatus, setNicknameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
    const [suggestions, setSuggestions] = useState([]);
    const [checkTimeout, setCheckTimeout] = useState(null);

    useEffect(() => {
        if (nickname.length >= 3) {
            // Debounce nickname check
            if (checkTimeout) clearTimeout(checkTimeout);

            setNicknameStatus('checking');
            const timeout = setTimeout(() => {
                checkNicknameAvailability(nickname);
            }, 500);

            setCheckTimeout(timeout);
        } else if (nickname.length > 0) {
            setNicknameStatus(null);
            setSuggestions([]);
        }
    }, [nickname]);

    const checkNicknameAvailability = async (value) => {
        try {
            const { data } = await apiClient.post('/users/check-nickname', { nickname: value });

            if (data.available) {
                setNicknameStatus('available');
                setSuggestions([]);
            } else {
                setNicknameStatus('taken');
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error checking nickname:', error);
            setNicknameStatus(null);
        }
    };

    const handleNicknameChange = (e) => {
        let value = e.target.value;
        // Auto-sanitize: lowercase, alphanumeric + ._-
        value = value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
        setNickname(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nicknameStatus === 'available' && firstName && lastName) {
            onNext({ nickname, firstName, lastName });
        }
    };

    const canProceed = nicknameStatus === 'available' && firstName.trim().length >= 2 && lastName.trim().length >= 2;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Personaliza tu perfil</h1>
                <p className="text-zinc-400">Comencemos con lo básico</p>
            </div>

            {/* Nickname */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre de usuario
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={nickname}
                        onChange={handleNicknameChange}
                        placeholder="tu_nickname"
                        maxLength={30}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                        required
                    />
                    {nicknameStatus && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {nicknameStatus === 'checking' && <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />}
                            {nicknameStatus === 'available' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {nicknameStatus === 'taken' && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                    )}
                </div>

                {/* Status Message */}
                {nicknameStatus === 'checking' && (
                    <p className="text-xs text-yellow-500 mt-2">Comprobando disponibilidad...</p>
                )}
                {nicknameStatus === 'available' && (
                    <p className="text-xs text-green-500 mt-2">✓ Disponible</p>
                )}
                {nicknameStatus === 'taken' && (
                    <p className="text-xs text-red-500 mt-2">✗ Este nombre ya está en uso</p>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-zinc-500 mb-2">Sugerencias:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setNickname(suggestion)}
                                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-xs text-zinc-600 mt-2">
                    Solo letras, números, puntos, guiones y guiones bajos. Mín. 3 caracteres.
                </p>
            </div>

            {/* First Name */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre
                </label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                    required
                />
            </div>

            {/* Last Name */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Apellido
                </label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                    required
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-zinc-800">
                <button
                    type="submit"
                    disabled={!canProceed}
                    className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>
        </form>
    );
};

export default Step1BasicInfo;
