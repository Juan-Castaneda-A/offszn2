import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiPlay, BiCheckCircle } from 'react-icons/bi';
import SecureImage from '../ui/SecureImage';
import { apiClient } from '../../api/client';

const ProducerHoverCard = ({ nickname, isVerified, triggerRect, onMouseEnter, onMouseLeave }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!nickname) return; // Seguridad: si no hay nickname, no hagas nada

            try {
                setLoading(true);
                // 1. Limpiamos el nickname (quitamos el @ si existe)
                const cleanNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;

                // 2. Hacemos la petición SIN el símbolo @
                const res = await apiClient.get(`/users/${cleanNickname}`);
                setData(res.data);
                setIsFollowing(res.data.is_following);
            } catch (err) {
                console.error("Error fetching hover data:", err);
                setData(null); // Reset en caso de error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [nickname]);

    const handleFollowToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!data) return;

        try {
            if (isFollowing) {
                await apiClient.delete(`/social/following/${data.id}`);
                setIsFollowing(false);
            } else {
                await apiClient.post(`/social/following/${data.id}`);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error("Error toggling follow in hover card:", err);
        }
    };

    if (!triggerRect) return null;

    // Positioning logic simplified for React
    const cardWidth = 280;
    let left = triggerRect.left + (triggerRect.width / 2) - (cardWidth / 2);
    let top = triggerRect.bottom + 10;

    // Constrain to viewport
    if (left < 10) left = 10;
    if (left + cardWidth > window.innerWidth - 10) left = window.innerWidth - cardWidth - 10;

    return (
        <div
            className="fixed z-[9999] bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fadeIn pointer-events-auto w-[280px]"
            style={{ left, top }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {loading ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
                        <div className="flex flex-col gap-2">
                            <div className="w-24 h-4 bg-white/5 animate-pulse rounded" />
                            <div className="w-16 h-3 bg-white/5 animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            ) : data ? (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <SecureImage src={data.avatar_url} alt={data.nickname} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-white font-bold text-sm truncate">{data.nickname}</span>
                                {(isVerified || data.is_verified) && <BiCheckCircle className="text-blue-500 shrink-0" size={16} />}
                            </div>
                            <span className="text-[#666] text-[0.7rem] font-bold uppercase tracking-wider">
                                {data.products_count || 0} productos • {data.followers_count || 0} seguidores
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleFollowToggle}
                        className={`w-full py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isFollowing
                                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg'
                            }`}
                    >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>

                    <Link
                        to={`/@${data.nickname}`}
                        className="text-center text-[0.7rem] text-[#444] hover:text-white font-bold uppercase tracking-widest transition-colors"
                    >
                        Ver Perfil Completo
                    </Link>
                </div>
            ) : (
                <div className="text-xs text-center text-[#555]">Error al cargar info</div>
            )}
        </div>
    );
};

export default ProducerHoverCard;
