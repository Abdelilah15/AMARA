// Client/src/pages/SavedPosts.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import PostItem from '../components/PostItem';
import { toast } from 'react-toastify';

const SavedPosts = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const [savedPosts, setSavedPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [activeTab, setActiveTab] = useState('Tous');
    const [loading, setLoading] = useState(true);

    const fetchSavedPosts = async (collection = 'Tous') => {
        setLoading(true);
        try {
            // Note: On pourrait optimiser en filtrant côté client si on a déjà tout chargé
            // mais ici on demande au backend pour être sûr
            const url = collection === 'Tous' 
                ? `${backendUrl}/api/user/saved-posts`
                : `${backendUrl}/api/user/saved-posts?collectionName=${encodeURIComponent(collection)}`;

            const { data } = await axios.get(url);
            if (data.success) {
                // data.savedPosts contient [{ post: {...}, collectionName: "..." }, ...]
                // Nous devons extraire l'objet 'post' pour PostItem, mais garder le contexte
                const formattedPosts = data.savedPosts.map(item => item.post).filter(p => p !== null); 
                setSavedPosts(formattedPosts);
                
                // Mettre à jour la liste des collections (ajoute 'Tous' manuellement pour l'UI)
                setCollections(['Tous', ...data.collections]);
            }
        } catch (error) {
            toast.error("Erreur chargement sauvegardes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPosts(activeTab);
    }, [activeTab]);

    return (
        <div className="mt-16 min-h-screen bg-gray-100">
            <div className="max-w-2xl mx-auto pt-4">
                
                {/* Header / Titre */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <i className="fi fi-sr-bookmark flex text-indigo-600"></i>
                        Éléments enregistrés
                    </h1>
                </div>

                {/* Barres des onglets (Groupes) */}
                <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
                    {collections.map((col) => (
                        <button
                            key={col}
                            onClick={() => setActiveTab(col)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                                activeTab === col
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {col}
                        </button>
                    ))}
                </div>

                {/* Liste des posts */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Chargement...</div>
                    ) : savedPosts.length > 0 ? (
                        savedPosts.map((post) => (
                            <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <PostItem post={post} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl text-gray-500">
                            <i className="fi fi-rr-bookmark text-4xl mb-3 block opacity-30"></i>
                            Aucun post enregistré dans "{activeTab}".
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedPosts;