import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Assurez-vous d'avoir une icône de fermeture (cross/times)

const CreatePostModal = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { backendUrl, userData } = useContext(AppContext);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content);
            // Ajouter chaque fichier au FormData
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
                onClose(); // Fermer la modale
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
            <div className="bg-gray-800 w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Créer un post</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                    {/* Infos utilisateur */}
                    <div className="flex items-center gap-3">
                        <img src={userData?.image || assets.user_robot} alt="" className="w-10 h-10 rounded-full bg-indigo-500 object-cover" />
                        <span className="text-white font-medium capitalize">{userData?.name}</span>
                    </div>

                    {/* Zone de texte */}
                    <div className="relative">
                        <textarea
                            className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
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

                    {/* Prévisualisation des fichiers (Nom du fichier simple pour l'instant) */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, index) => (
                                <div key={index} className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions et Upload */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        
                        {/* Bouton Upload personalisé */}
                        <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                            <i className="fi fi-rr-clip"></i> {/* Exemple d'icône */}
                            <span className="text-sm font-medium">Ajouter média</span>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </label>

                        <button 
                            type="submit" 
                            disabled={loading || (!content && files.length === 0)}
                            className={`px-6 py-2 rounded-full font-bold text-white transition-all ${
                                loading || (!content && files.length === 0) 
                                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transform active:scale-95'
                            }`}
                        >
                            {loading ? 'Envoi...' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;