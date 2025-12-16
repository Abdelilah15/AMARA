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
                setSavedPosts(data.savedPosts);
                const uniqueCollections = ['Tous', ...new Set(data.collections)];
                setCollections(uniqueCollections);
            }
        } catch (error) {
            toast.error("Erreur chargement sauvegardes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchSavedPosts(activeTab);
        }
    }, [activeTab, userData]);


    return (
        <div className="pt-16 min-h-screen bg-gray-100">
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
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeTab === col
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
                        savedPosts.map((item) => (
                            // CORRECTION 3 : On utilise 'item.post' pour passer les données du post, 
                            // et on utilise item._id (l'ID de la sauvegarde) comme clé unique.
                            <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {item.post ? (
                                    <PostItem post={item.post} />
                                ) : (
                                    <div className="p-4 text-gray-400 text-sm">Post indisponible</div>
                                )}
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