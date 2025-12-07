// src/components/PostItem.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const PostItem = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const { userData, backendUrl } = useContext(AppContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Fonction pour supprimer le post
    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

        try {
            const { data } = await axios.delete(backendUrl + `/api/post/delete/${post._id}`);
            if (data.success) {
                toast.success("Post supprimé");
                // On prévient le parent (Feed ou Profile) qu'il faut retirer ce post de la liste
                if (onDelete) onDelete(post._id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg mb-4 animate-fade-in">
            {/* --- HEADER DU POST --- */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar cliquable */}
                    <img
                        onClick={() => navigate(`/@${post.userId?.username}`)}
                        src={post.userId?.image || assets.user_robot}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover bg-gray-700 cursor-pointer"
                    />
                    <div>
                        {/* Nom cliquable */}
                        <h3
                            onClick={() => navigate(`/@${post.userId?.username}`)}
                            className="font-bold capitalize cursor-pointer hover:underline text-white">
                            {post.userId?.name || "Utilisateur"}
                        </h3>
                        <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* --- MENU 3 POINTS --- */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-xl z-10 overflow-hidden">
                            {userData && (userData._id === post.userId?._id) ? (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <i className="fi fi-rr-trash"></i> Supprimer
                                </button>
                            ) : (
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                                    <i className="fi fi-rr-flag"></i> Signaler
                                </button>
                            )}
                            <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                                <i className="fi fi-rr-cross-small"></i> Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONTENU TEXTE --- */}
            <p className="text-gray-200 mb-3 whitespace-pre-wrap">{post.content}</p>

            {/* --- CONTENU MEDIA --- */}
            {post.media && post.media.length > 0 && (
                <div className={`grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.media.map((item, index) => (
                        <img
                            key={index}
                            src={`${backendUrl}/${item}`}
                            alt="Post content"
                            className="w-full max-h-120 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                            // Si vous avez une fonction d'ouverture d'image en grand, vous pouvez la passer en prop
                        />
                    ))}
                </div>
            )}

            {/* --- FOOTER (ACTIONS) --- */}
            <div className="flex gap-4 mt-4 pt-3 border-t border-gray-700 text-gray-400">
                <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <i className="fi fi-rr-heart"></i> J'aime
                </button>
                <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <i className="fi fi-rr-comment-alt"></i> Commenter
                </button>
            </div>
        </div>
    );
};

export default PostItem;