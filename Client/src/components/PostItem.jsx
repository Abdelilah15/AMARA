// src/components/PostItem.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import DOMPurify from 'dompurify';

const PostItem = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const { userData, backendUrl, setMediaModalData } = useContext(AppContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const rawMediaUrl = post.media && post.media.length > 0 ? post.media[0] : null;
    const [showControls, setShowControls] = useState(false);

    const mediaUrl = rawMediaUrl
        ? (rawMediaUrl.startsWith('http') ? rawMediaUrl : backendUrl + '/' + rawMediaUrl)
        : null;

    const getMediaType = (url) => {
        if (!url) return null;
        const extension = url.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
            return 'video';
        }
        return 'image'; // Par défaut on considère que c'est une image
    };
    const mediaType = getMediaType(rawMediaUrl);

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

    const handleMediaClick = () => {
        if (mediaUrl && mediaType) {
            setMediaModalData({
                url: mediaUrl,
                type: mediaType
            });
        }
    };

    const renderStyledContent = (text) => {
        if (!text) return null;

        // On découpe le texte par ligne pour gérer les citations (qui prennent toute la ligne)
        const lines = text.split('\n');

        return lines.map((line, index) => {
            // Gestion des citations (lignes commençant par >)
            if (line.startsWith('>')) {
                const quoteContent = line.replace(/^>\s?/, '');
                return (
                    <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-1 my-2 bg-gray-50 text-gray-600 italic rounded-r">
                        {parseInlineFormatting(quoteContent)}
                    </blockquote>
                );
            }

            // Ligne vide (pour conserver les sauts de ligne)
            if (line.trim() === '') {
                return <br key={index} />;
            }

            // Paragraphe standard
            return (
                <div key={index} className="min-h-[1.5em]">
                    {parseInlineFormatting(line)}
                </div>
            );
        });
    };

    const parseInlineFormatting = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <div className="w-full bg-white border-b border-gray-300 p-4 animate-fade-in">
            {/* --- HEADER DU POST --- */}
            <div className="flex justify-between items-start mb-3 w-fuul">
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
                            className="font-bold capitalize cursor-pointer hover:underline text-gray-700">
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
                        className="text-gray-600 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 w-48 bg-white rounded-xl border border-gray-600 rounded-md shadow-xl z-10 overflow-hidden">
                            {userData && (userData._id === post.userId?._id) ? (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-3 pt-3 text-sm text-red-400 hover:bg-gray-100 flex items-center gap-2">
                                    <i className="fi fi-rr-trash"></i> Supprimer
                                </button>
                            ) : (
                                <button
                                    className="w-full text-left px-3 pt-3 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                    <i className="fi fi-rr-flag"></i> Signaler
                                </button>
                            )}
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full text-left px-3 pt-1 pb-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                <i className="fi fi-rr-cross-small"></i> Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="mb-4"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            >
                <div
                    className="post-content text-gray-700 mb-4 break-words whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                ></div>

                {mediaUrl && mediaType === 'image' && (
                    <img
                        src={mediaUrl}
                        alt="Post media"
                        // AJOUTS ICI : onClick et cursor-pointer
                        onClick={handleMediaClick}
                        className="w-full max-h-120 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    />
                )}
                {mediaUrl && mediaType === 'video' && (
                    <video
                        src={mediaUrl}
                        controls={showControls}
                        // AJOUTS ICI : onClick et cursor-pointer
                        // Note : sur une vidéo avec contrôles natifs, le onClick peut parfois être intercepté par les contrôles (play/pause).
                        // Pour une vraie expérience "cliquer pour agrandir" sur vidéo, il faudrait souvent masquer les contrôles natifs et mettre un overlay transparent, mais commençons simple.
                        onClick={handleMediaClick}
                        autoPlay
                        preload="auto"
                        loop
                        className="w-full max-h-120 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* --- FOOTER (ACTIONS) --- */}
            <div className="flex justify-between mt-4 p-1 pt-2 px-4 rounded-full bg-gray-200 text-gray-600">
                <div className='flex gap-4'>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i className="fi fi-tr-heart"></i>
                    </button>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i class="fi fi-tr-arrows-repeat"></i>
                    </button>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i className="fi fi-tr-comment-alt"></i>
                    </button>
                </div>
                <div className='flex gap-4'>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i class="fi fi-tr-up"></i>
                    </button>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i className="fi fi-tr-bookmark"></i>
                    </button>
                    <button className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <i className="fi fi-tr-share-square"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostItem;