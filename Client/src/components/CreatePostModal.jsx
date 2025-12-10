import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [plainTextLength, setPlainTextLength] = useState(0);
    const [files, setFiles] = useState([]);
    // Stocker les URLs de prévisualisation pour éviter les fuites de mémoire
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { backendUrl, userData } = useContext(AppContext);
    const MAX_CHAR = 800;
    const textareaRef = useRef(null);

    // 2. Référence vers l'instance Quill pour le contrôler depuis le footer
    const quillRef = useRef(null);
    // Configuration de Quill pour cacher la toolbar par défaut
    const modules = useMemo(() => ({
        toolbar: false, // On cache la toolbar native
        keyboard: {
            bindings: { tab: false }
        },
        clipboard: {
            matchVisual: false,
            // Cette configuration force le collage en texte brut
            matchers: [
                [Node.ELEMENT_NODE, (node, delta) => {
                    // On parcourt chaque morceau de texte collé (op)
                    delta.ops = delta.ops.map(op => {
                        // On ne retourne que l'insert (le texte) en supprimant les attributs (le style)
                        return { insert: op.insert };
                    });
                    return delta;
                }]
            ]
        }
    }), []);


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

    // 3. Nouvelle fonction de formatage utilisant l'API Quill
    const insertFormat = (type) => {
        if (!quillRef.current) return;

        // On récupère l'instance interne de l'éditeur
        const editor = quillRef.current.getEditor();

        // On se assure que l'éditeur a le focus
        editor.focus();

        // On récupère le format actuel à la position du curseur
        const currentFormat = editor.getFormat();

        switch (type) {
            case 'bold':
                editor.format('bold', !currentFormat.bold);
                break;
            case 'italic':
                editor.format('italic', !currentFormat.italic);
                break;
            case 'quote':
                // 'blockquote' est le nom du format dans Quill
                editor.format('blockquote', !currentFormat.blockquote);
                break;
            default:
                return;
        }
    };

    // --- Gestion Changement avec calcul précis des caractères ---
    const handleEditorChange = (htmlContent, delta, source, editor) => {
        setContent(htmlContent);
        // editor.getText() renvoie le texte pur. .trim() enlève les espaces superflus au début/fin.
        const text = editor.getText();
        // Quill ajoute toujours un \n à la fin, on le retire pour le compte réel si le reste est vide
        const realLength = text.replace(/\n$/, "").length;
        setPlainTextLength(realLength);
    };

    const handleFileChange = (e) => {
        // Convertir FileList en Array pour faciliter la manipulation
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Vérification basée sur le TEXTE BRUT (pas le HTML)
        if (plainTextLength > MAX_CHAR) {
            toast.error(`Le message est trop long (${plainTextLength}/${MAX_CHAR})`);
            return;
        }

        // Vérification contenu vide (Quill laisse parfois des balises <p><br></p>)
        const isEmpty = plainTextLength === 0 && files.length === 0;
        if (isEmpty) {
            toast.error("Le post ne peut pas être vide");
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

                        {/* Zone d'édition Quill */}
                        <div className="relative w-full group">
                            {/* Style Override pour le Dark Mode de Quill */}
                            <style>{`
                                .ql-editor {
                                    min-height: 120px;
                                    font-size: 1rem;
                                    color: white; /* Texte blanc */
                                    padding: 0.75rem !important;
                                }
                                .ql-editor.ql-blank::before {
                                    color: #9ca3af !important; /* Placeholder gris (text-gray-400) */
                                    font-style: normal;
                                }
                                .ql-container.ql-snow {
                                    border: none !important; /* Enlever la bordure par défaut */
                                }
                                /* Style pour les citations dans l'éditeur */
                                .ql-editor blockquote {
                                    border-left: 4px solid #6366f1;
                                    padding-left: 10px;
                                    color: #cbd5e1;
                                    font-style: italic;
                                }
                            `}</style>

                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={handleEditorChange}
                                modules={modules}
                                placeholder="De quoi voulez-vous parler ?"
                                className="w-full bg-transparent"
                            />

                            {/* Compteur de caractères (Texte brut) */}
                            <div className={`text-right text-xs font-semibold mt-1 transition-colors ${isOverLimit ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {isOverLimit ? `-${extraContentCount}` : plainTextLength} / {MAX_CHAR}
                            </div>
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

                            {/* Barre d'outils personnalisée connectée à Quill */}
                            <div className="flex gap-1 border-l border-gray-600 pl-4">
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); insertFormat('bold'); }} // onMouseDown évite de perdre le focus de l'éditeur
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                    title="Gras"
                                >
                                    <i className="fi fi-rr-bold flex"></i>
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); insertFormat('italic'); }} 
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                    title="Italique"
                                >
                                    <i className="fi fi-rr-italic flex"></i>
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); insertFormat('quote'); }} 
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                    title="Citation"
                                >
                                    <i className="fi fi-rr-quote-right flex"></i>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || (plainTextLength === 0 && files.length === 0) || isOverLimit}
                            className={`px-6 py-2 rounded-full font-bold text-white transition-all shadow-lg ${loading || (plainTextLength === 0 && files.length === 0) || isOverLimit
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