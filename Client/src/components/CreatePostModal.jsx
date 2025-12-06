import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const CreatePostModal = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    // Stocker les URLs de prévisualisation pour éviter les fuites de mémoire
    const [previews, setPreviews] = useState([]); 
    const [loading, setLoading] = useState(false);
    const { backendUrl, userData } = useContext(AppContext);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content);
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-800 w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
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
                        <div className="relative">
                            <textarea
                                className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all placeholder-gray-500"
                                placeholder="De quoi voulez-vous parler ?"
                                rows="4"
                                maxLength={300}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                            <span className={`absolute bottom-2 right-2 text-xs ${content.length === 300 ? 'text-red-500' : 'text-gray-500'}`}>
                                {content.length}/300
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
                <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
                    <div className="flex justify-between items-center">
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

                        <button 
                            onClick={handleSubmit}
                            disabled={loading || (!content && files.length === 0)}
                            className={`px-6 py-2 rounded-full font-bold text-white transition-all shadow-lg ${
                                loading || (!content && files.length === 0) 
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