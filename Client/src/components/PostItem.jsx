// src/components/PostItem.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import DOMPurify from 'dompurify';
import linkifyHtml from 'linkify-html';
import '../index.css';
import { timeAgo } from '../utils/timeAgo';
import ReactionsBar from './ReactionsBar';

// --- SOUS-COMPOSANT : GESTION DE LA GALERIE ---
const PostGallery = ({ mediaList, backendUrl, onMediaClick }) => {
    if (!mediaList || mediaList.length === 0) return null;

    const count = mediaList.length;

    // Fonction utilitaire pour formater l'URL correctement pour chaque image
    const getFullUrl = (url) => {
        return url.startsWith('http') ? url : `${backendUrl}/${url}`;
    };

    // Helper pour générer une balise image standard
    const renderImage = (url, index, extraClass = "") => (
        <img
            key={index}
            src={getFullUrl(url)}
            alt={`media-${index}`}
            onClick={() => onMediaClick(index)}
            className={`media-item ${extraClass}`}
        />
    );

    // --- CAS 1 : Un seul média (Image ou Vidéo) ---
    if (count === 1) {
        const url = getFullUrl(mediaList[0]);
        const extension = url.split('.').pop().toLowerCase();
        const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension);

        if (isVideo) {
            return (
                <div className="media-gallery gallery-1">
                    <video
                        src={url}
                        controls
                        className="media-item"
                        onClick={() => onMediaClick(0)}
                    />
                </div>
            );
        }
        return <div className="media-gallery gallery-1">{renderImage(mediaList[0], 0)}</div>;
    }

    // --- CAS 2 : Deux images (50% / 50%) ---
    if (count === 2) {
        return (
            <div className="media-gallery gallery-2">
                {mediaList.map((url, i) => renderImage(url, i))}
            </div>
        );
    }

    // --- CAS 3 : Trois images (1 grande à gauche, 2 à droite) ---
    if (count === 3) {
        return (
            <div className="media-gallery gallery-3">
                {renderImage(mediaList[0], 0)}
                {renderImage(mediaList[1], 1)}
                {renderImage(mediaList[2], 2)}
            </div>
        );
    }

    // --- CAS 4 : Quatre images (Grille 2x2) ---
    if (count === 4) {
        return (
            <div className="media-gallery gallery-4">
                {mediaList.map((url, i) => renderImage(url, i))}
            </div>
        );
    }

    // --- CAS 5 et plus : (3 images + 1 overlay) ---
    if (count >= 5) {
        const hiddenCount = count - 4;
        return (
            <div className="media-gallery gallery-5-plus">
                {renderImage(mediaList[0], 0)}
                {renderImage(mediaList[1], 1)}
                {renderImage(mediaList[2], 2)}

                {/* La 4ème case avec l'overlay */}
                <div className="more-media-overlay" onClick={() => onMediaClick(3)}>
                    <img src={getFullUrl(mediaList[3])} alt="media-more" className="media-item" />
                    <div className="overlay-count">+{hiddenCount + 1}</div>
                </div>
            </div>
        );
    }
};

const PostItem = ({ post, onDelete, isDetail = false }) => {
    const navigate = useNavigate();
    const { userData, backendUrl, setMediaModalData } = useContext(AppContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const rawMediaUrl = post.media && post.media.length > 0 ? post.media[0] : null;
    const [showControls, setShowControls] = useState(false);
    const [processedContent, setProcessedContent] = useState('');

    const authorName = post.userId ? post.userId.name : "Utilisateur Inconnu";
    const authorUsername = post.userId ? post.userId.username : "inconnu";
    const authorAvatar = (post.userId && post.userId.avatar) ? post.userId.avatar : assets.profile_icon; // Image par défaut
    const postDate = post.createdAt;

    const isLiked = post.likes && post.likes.includes(userData?._id);
    const isSaved = post.saves && post.saves.includes(userData?._id);

const handlePostClick = () => {
        // Si on n'est PAS déjà sur la page de détail, on redirige
        if (!isDetail) {
            navigate(`/post/${post._id}`);
        }
    };

    const handleLike = async (e) => {
    e.stopPropagation();
    // ... votre logique de like existante ou future
  };

  const handleComment = (e) => {
    e.stopPropagation();
    // ... logique pour ouvrir les commentaires
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // ... logique de partage
  };
  
  const handleSave = (e) => {
    e.stopPropagation();
    // ... logique de sauvegarde
  };

    // Fonction pour copier le lien
    const copyLink = () => {
        // Génère le lien (ajustez '/post/' selon vos routes réelles)
        const link = `${window.location.origin}/post/${post._id}`;

        navigator.clipboard.writeText(link)
            .then(() => {
                toast.success("Lien copié !");
                setIsMenuOpen(false); // Fermer le menu après le clic
            })
            .catch((err) => {
                toast.error("Erreur lors de la copie");
                console.error('Erreur copie :', err);
            });
    };


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

    // --- 2. Effet pour traiter le contenu (Linkify + Sanitize) ---
    useEffect(() => {
        if (post.content) {
            // Configuration pour rendre les liens bleus et ouvrables dans un nouvel onglet
            const linkifyOptions = {
                defaultProtocol: 'https',
                target: '_blank',
                className: 'text-blue-500 hover:underline break-all', // Classes Tailwind pour le bleu
                attributes: {
                    rel: 'noopener noreferrer'
                },
                // Ignore les balises img, script, etc. pour ne pas casser le HTML existant
                ignoreTags: ['script', 'style', 'img', 'video']
            };

            // Etape A : On transforme les URLs textuelles en balises <a>
            const linkedHtml = linkifyHtml(post.content, linkifyOptions);

            // Etape B : On nettoie le HTML (en autorisant target et class pour nos liens)
            const cleanHtml = DOMPurify.sanitize(linkedHtml, {
                ADD_ATTR: ['target', 'class', 'rel'], // IMPORTANT : Autoriser ces attributs
                ADD_TAGS: ['iframe'], // Si vous voulez autoriser des embeds plus tard
            });

            setProcessedContent(cleanHtml);
        }
    }, [post.content]);

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

    // Cette fonction reçoit maintenant l'index de l'élément cliqué
    const handleMediaClick = (index) => {
        // On récupère la liste brute
        const rawList = post.media && post.media.length > 0 ? post.media : (post.image ? [post.image] : []);

        // On formate toutes les URLs pour qu'elles soient prêtes pour la modale
        const formattedList = rawList.map(url =>
            url.startsWith('http') ? url : `${backendUrl}/${url}`
        );

        // On envoie la liste ET l'index de départ
        setMediaModalData({
            mediaList: formattedList,
            initialIndex: index
        });
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
            <div className="flex justify-between items-start w-fuul">
                <div className="flex items-center gap-3">
                    {/* Avatar cliquable */}
                    <img
                        onClick={() => navigate(`/@${post.userId?.username}`)}
                        src={post.userId?.image || assets.user_robot}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover bg-gray-700 cursor-pointer"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            {/* Nom complet */}
                            <span className="font-bold text-gray-900">{authorName}</span>
                            {/* Nom d'utilisateur (@username) */}
                            <span className="text-gray-500 text-sm">@{authorUsername}</span>
                            {/* Point séparateur */}
                            <span className="text-gray-400 text-xs">•</span>
                            {/* Horodatage Relatif */}
                            <span className="text-gray-500 text-sm hover:underline cursor-pointer" title={new Date(postDate).toLocaleString()}>
                                {timeAgo(postDate)}
                            </span>
                        </div>
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
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-100 flex items-center gap-2">
                                    <i className="fi fi-rr-trash flex"></i> Supprimer
                                </button>
                            ) : (
                                <button
                                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                    <i className="fi fi-tr-link-alt flex"></i> Signaler
                                </button>
                            )}

                            <button
                                onClick={copyLink}
                                className="w-full text-left px-3 pt-1 pb-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                <i className="fi fi-sr-link-alt flex"></i> Copier le lien
                            </button>

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
            <div className={`mb-4 pl-13.5 ${!isDetail ? 'cursor-pointer hover:bg-gray-50 transition-colors rounded-lg -ml-2 p-2' : ''}`}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
                onClick={handlePostClick}
            >
                {/* --- 3. Affichage du contenu traité --- */}
                <div
                    className="post-content text-gray-800 text-sm leading-relaxed mb-3 break-words whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                ></div>

                {/* --- NOUVEAU : AFFICHAGE DU LINK PREVIEW --- */}
                {post.linkPreview && post.media.length === 0 && (
                    <>
                        <a
                            href={post.linkPreview.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mb-4 rounded-xl overflow-hidden border border-gray-300 hover:bg-gray-50 transition-colors group"
                        >
                            {post.linkPreview.image && (
                                <div className="max-h-64 overflow-hidden bg-gray-100 border-b border-gray-200">
                                    <img
                                        src={post.linkPreview.image}
                                        alt={post.linkPreview.title}
                                        className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                                        onError={(e) => e.target.style.display = 'none'} // Cache si l'image est brisée
                                    />
                                </div>
                            )}
                            <div className="p-3">
                                <div className="text-xs text-gray-500 uppercase mb-1 font-medium">
                                    {post.linkPreview.domain}
                                </div>
                                <h4 className="text-gray-900 font-bold text-base mb-1 line-clamp-1">
                                    {post.linkPreview.title}
                                </h4>
                                <p className="text-gray-600 text-sm line-clamp-2">
                                    {post.linkPreview.description}
                                </p>
                            </div>
                        </a>
                    </>
                )}

                {post.linkPreview && post.media.length > 0 && (

                    <a
                        href={post.linkPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex rounded-xl overflow-hidden border border-gray-300 hover:bg-gray-100 transition-colors group"
                    >
                        {post.linkPreview.image && (
                            <div className="w-32 h-24 overflow-hidden bg-gray-100">
                                <img
                                    src={post.linkPreview.image}
                                    alt={post.linkPreview.title}
                                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                                    onError={(e) => e.target.style.display = 'none'} // Cache si l'image est brisée
                                />
                            </div>
                        )}
                        <div className="p-3 flex flex-col justify-center bg-gray-50">
                            <div className="text-xs text-gray-500 uppercase font-medium">
                                {post.linkPreview.domain}
                            </div>
                            <h4 className="text-gray-900 font-bold text-base line-clamp-1">
                                {post.linkPreview.title}
                            </h4>
                            <p className="text-gray-600 text-sm line-clamp-1">
                                {post.linkPreview.description}
                            </p>
                        </div>
                    </a>

                )}

                {/* --- NOUVELLE GALERIE --- */}
                {/* On passe le tableau post.media ou on crée un tableau si c'est l'ancien format post.image */}
                <PostGallery
                    mediaList={post.media && post.media.length > 0 ? post.media : (post.image ? [post.image] : [])}
                    backendUrl={backendUrl}
                    onMediaClick={handleMediaClick}
                />
            </div>

            {/* --- FOOTER (ACTIONS) --- */}
            <div >
                <ReactionsBar
                    post={post}
                    isLiked={isLiked}
                    isSaved={isSaved}
                    handleLike={handleLike}
                    handleComment={handleComment}
                    handleShare={handleShare}
                    handleSave={handleSave}
                />
            </div>
        </div>
    );
};

export default PostItem;