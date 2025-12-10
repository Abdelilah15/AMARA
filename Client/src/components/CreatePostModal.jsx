import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    // Stocker les URLs de prévisualisation pour éviter les fuites de mémoire
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { backendUrl, userData } = useContext(AppContext);
    const MAX_CHAR = 800;
    const textareaRef = useRef(null);

    // Nettoyer les URLs d'objets quand le composant est démonté ou quand les fichiers changent
    useEffect(() => {
        if (!files) return;

        const newPreviews = [];
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                newPreviews.push({
                    url: URL.createObjectURL(file),
                    type: 'image',
                    name: file.name
                });
            } else {
                newPreviews.push({
                    type: 'other',
                    name: file.name
                });
            }
        });
        setPreviews(newPreviews);

        // Cleanup function
        return () => {
            newPreviews.forEach(p => {
                if (p.type === 'image') URL.revokeObjectURL(p.url);
            });
        };
    }, [files]);

    if (!isOpen) return null;


    const handleFileChange = (e) => {
        // Convertir FileList en Array pour faciliter la manipulation
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const insertFormat = (type) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = '';
        let newCursorPos = 0;

        switch (type) {
            case 'bold':
                newText = content.substring(0, start) + `**${selectedText || 'gras'}**` + content.substring(end);
                newCursorPos = start + (selectedText ? selectedText.length + 4 : 2); // Positionner curseur
                break;
            case 'italic':
                newText = content.substring(0, start) + `*${selectedText || 'italique'}*` + content.substring(end);
                newCursorPos = start + (selectedText ? selectedText.length + 2 : 1);
                break;
            case 'quote':
                // Ajouter un saut de ligne si on n'est pas au début
                const prefix = start > 0 ? '\n> ' : '> ';
                newText = content.substring(0, start) + `${prefix}${selectedText || 'citation'}` + content.substring(end);
                newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 8);
                break;
            default:
                return;
        }

        setContent(newText);
        // Remettre le focus et le curseur
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (content.length > MAX_CHAR) {
            toast.error(`Le message est trop long (${content.length}/${MAX_CHAR})`);
            return;
        }
        setLoading(true);

        try {

            const formData = new FormData();
            formData.append('content', content);

            if (userData && userData._id) {
                formData.append('userId', userData._id);
            }
            files.forEach((file) => {
                formData.append('files', file);
            });

            const { data } = await axios.post(backendUrl + '/api/post/create', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success(data.message);
                setContent('');
                setFiles([]);
                if (typeof onPostCreated === 'function') {
                    onPostCreated(data.post); // on transmet le post créé (si tu veux)
                }
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isOverLimit = content.length > MAX_CHAR;
    const extraContentCount = content.length - MAX_CHAR;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center py-1 px-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Créer un post</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">
                        ✕
                    </button>
                </div>

                {/* Body scrollable */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Infos utilisateur */}
                        <div className="flex items-center gap-3">
                            <img src={userData?.image || assets.user_robot} alt="" className="w-10 h-10 rounded-full bg-indigo-500 object-cover" />
                            <span className="text-white font-medium capitalize">{userData?.name}</span>
                        </div>

                        {/* Zone de texte */}
                        <div className="relative w-full group">
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 w-full p-3 whitespace-pre-wrap break-words font-sans text-base pointer-events-none"
                                style={{
                                    minHeight: '6rem', // Doit correspondre au min-height ou rows du textarea
                                    color: 'transparent' // Le texte normal est transparent pour laisser voir le textarea devant
                                }}
                            >
                                {/* Partie valide (invisible) */}
                                <span>{content.slice(0, MAX_CHAR)}</span>
                                {/* Partie invalide (fond rouge visible) */}
                                <span className="bg-red-500/50 decoration-wavy underline decoration-red-500 text-transparent rounded-sm">
                                    {content.slice(MAX_CHAR)}
                                </span>
                            </div>

                            <textarea
                                ref={textareaRef}
                                className="w-full resize-none text-white p-3 outline-none transition-all placeholder-gray-500"
                                placeholder="De quoi voulez-vous parler ?"
                                rows="4"
                                onInput={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                    const backdrop = e.target.previousSibling;
                                    if (backdrop) backdrop.style.height = e.target.style.height;
                                }}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ minHeight: '6rem' }}
                            ></textarea>
                            {/* Compteur de caractères */}
                            <span className={`absolute bottom-2 right-2 text-xs font-semibold transition-colors ${isOverLimit ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {isOverLimit ? `-${extraContentCount}` : content.length} / {MAX_CHAR}
                            </span>
                        </div>

                        {/* --- Prévisualisation des images (MODIFIÉ) --- */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-600 bg-gray-900">
                                        {/* Bouton supprimer l'image */}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors z-10"
                                        >
                                            ✕
                                        </button>

                                        {preview.type === 'image' ? (
                                            <img
                                                src={preview.url}
                                                alt="Preview"
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-40 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <i className="fi fi-rr-file text-2xl"></i>
                                                <span className="text-xs truncate px-2 max-w-full">{preview.name}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Fixe */}
                <div className="px-4 py-2 border-t border-gray-700 bg-gray-800 rounded-b-xl">
                    <div className="flex justify-between items-center">
                        <div className='flex justify-center'>
                            {/* Bouton Upload */}
                            <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700/50">
                                <i className="fi fi-tr-picture flex text-xl"></i>
                                <span className="text-sm font-medium">Média</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {/* 3. AJOUT: Barre d'outils de formatage */}
                            <div className="flex gap-2 mb-1 px-1">
                                <button type="button" onClick={() => insertFormat('bold')} className="p-1 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded text-sm font-bold" title="">
                                    <i className="fi fi-rr-bold flex"></i>
                                </button>
                                <button type="button" onClick={() => insertFormat('italic')} className="p-1 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded text-sm italic" title="">
                                    <i className="fi fi-rr-italic flex"></i>
                                </button>
                                <button type="button" onClick={() => insertFormat('quote')} className="p-1 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded text-sm" title="">
                                    <i className="fi fi-rr-quote-right flex"></i>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content && files.length === 0) || isOverLimit}
                            className={`px-6 py-2 rounded-full font-bold text-white transition-all shadow-lg ${loading || (!content && files.length === 0) || isOverLimit
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 hover:shadow-indigo-500/30'
                                }`}
                        >
                            {loading ? 'Envoi...' : 'Publier'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;