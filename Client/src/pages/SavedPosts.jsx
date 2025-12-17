// Client/src/pages/SavedPosts.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import PostItem from '../components/PostItem';
import { toast } from 'react-toastify';
import { IconDotsVertical, IconPin, IconPencil, IconPalette, IconTrash, IconX } from '@tabler/icons-react';

const SavedPosts = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const [savedPosts, setSavedPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [activeTab, setActiveTab] = useState('Tous');
    const [loading, setLoading] = useState(true);

    const [menuOpenId, setMenuOpenId] = useState(null); // ID de la collection dont le menu est ouvert
    const [modal, setModal] = useState({ type: null, collection: null });

    const menuRef = useRef(null);

    const [renameInput, setRenameInput] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Couleurs disponibles
    const colorOptions = [
        { name: 'Gris', class: 'bg-gray-200', text: 'text-gray-700' },
        { name: 'Rouge', class: 'bg-red-100', text: 'text-red-700' },
        { name: 'Bleu', class: 'bg-blue-100', text: 'text-blue-700' },
        { name: 'Vert', class: 'bg-green-100', text: 'text-green-700' },
        { name: 'Jaune', class: 'bg-yellow-100', text: 'text-yellow-700' },
        { name: 'Violet', class: 'bg-purple-100', text: 'text-purple-700' },
        { name: 'Rose', class: 'bg-pink-100', text: 'text-pink-700' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSavedPosts = async (collection = 'Tous') => {
        setLoading(true);
        try {
            // Note: On pourrait optimiser en filtrant côté client si on a déjà tout chargé
            // mais ici on demande au backend pour être sûr
            const queryParam = collection === 'Tous' ? '' : `?collectionName=${encodeURIComponent(collection)}`;

            const { data } = await axios.get(`${backendUrl}/api/user/saved-posts${queryParam}`, { withCredentials: true });

            if (data.success) {
                setSavedPosts(data.savedPosts);

                // On traite les collections reçues du backend
                // Le backend doit maintenant renvoyer un tableau d'objets complets
                let fetchedCollections = data.collections || [];

                // On s'assure que Général est là
                const generalExists = fetchedCollections.find(c => c.name === 'Général');
                if (!generalExists) {
                    fetchedCollections.unshift({ name: 'Général', _id: 'general_id', color: 'bg-gray-200', pinned: false });
                }

                // Logique de tri : Général en premier, puis Épinglés, puis les autres
                fetchedCollections.sort((a, b) => {
                    if (a.name === 'Général') return -1;
                    if (b.name === 'Général') return 1;
                    if (a.pinned === b.pinned) return 0; // Si même statut d'épingle, ordre normal
                    return a.pinned ? -1 : 1; // Épinglés en premier
                });

                setCollections(fetchedCollections);
            } else {
                toast.error(data.message || "Erreur récupération");
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

    // --- ACTIONS ---

    const handlePin = async (collection) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/collection/toggle-pin`,
                { collectionId: collection._id },
                { withCredentials: true }
            );
            if (data.success) {
                fetchSavedPosts(activeTab);
                setMenuOpenId(null);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error("Erreur action épingle");
        }
    };

    const handleRename = async () => {
        if (!renameInput.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/collection/rename`,
                { collectionId: modal.collection._id, newName: renameInput },
                { withCredentials: true }
            );
            if (data.success) {
                // Si on renomme la collection active, on met à jour l'onglet actif
                if (activeTab === modal.collection.name) setActiveTab(renameInput);
                fetchSavedPosts(activeTab === modal.collection.name ? renameInput : activeTab);
                closeModal();
                toast.success("Collection renommée");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Erreur renommage");
        }
    };

    const handleDelete = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/collection/delete`,
                { collectionId: modal.collection._id },
                { withCredentials: true }
            );
            if (data.success) {
                if (activeTab === modal.collection.name) setActiveTab('Tous');
                fetchSavedPosts('Tous');
                closeModal();
                toast.success("Collection supprimée");
            }
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    const handleColorChange = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/collection/color`,
                { collectionId: modal.collection._id, color: selectedColor },
                { withCredentials: true }
            );
            if (data.success) {
                fetchSavedPosts(activeTab);
                closeModal();
                toast.success("Couleur modifiée");
            }
        } catch (error) {
            toast.error("Erreur changement couleur");
        }
    };

    const openRenameModal = (col) => {
        setRenameInput(col.name);
        setModal({ type: 'rename', collection: col });
        setMenuOpenId(null);
    };

    const openColorModal = (col) => {
        setSelectedColor(col.color || 'bg-gray-200');
        setModal({ type: 'color', collection: col });
        setMenuOpenId(null);
    };

    const openDeleteModal = (col) => {
        setModal({ type: 'delete', collection: col });
        setMenuOpenId(null);
    };

    const closeModal = () => {
        setModal({ type: null, collection: null });
    };


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

                {/* BARRE DES ONGLETS */}
                <div className="flex overflow-x-auto gap-2 mb-4 pb-4 scrollbar-hide px-1">
                    {/* Bouton 'Tous' statique */}
                    <button
                        onClick={() => setActiveTab('Tous')}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeTab === 'Tous'
                            ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                    >
                        Tous
                    </button>

                    {collections.map((col) => (
                        <div key={col._id || col.name} className="relative group flex items-center">

                            {/* Le bouton de la collection */}
                            <button
                                onClick={() => setActiveTab(col.name)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex items-center gap-2 pr-8 ${activeTab === col.name
                                        ? 'bg-black text-white ring-2 ring-offset-1 ring-black'
                                        : `${col.color || 'bg-white'} text-gray-700 hover:opacity-90 shadow-sm`
                                    }`}
                            >
                                {col.pinned && <IconPin size={14} className={activeTab === col.name ? 'text-white' : 'text-gray-500'} />}
                                {col.name}
                            </button>

                            {/* Le bouton 3 points (Sauf pour Général) */}
                            {col.name !== 'Général' && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10" ref={menuRef}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpenId(menuOpenId === col._id ? null : col._id);
                                        }}
                                        className={`p-1 rounded-full hover:bg-black/10 transition-colors ${activeTab === col.name ? 'text-white hover:bg-white/20' : 'text-gray-500'
                                            }`}
                                    >
                                        <IconDotsVertical size={16} />
                                    </button>

                                    {/* MENU DÉROULANT */}
                                    {menuOpenId === col._id && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="py-1">
                                                <button onClick={() => handlePin(col)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                                    <IconPin size={16} />
                                                    {col.pinned ? 'Désépingler' : 'Épingler'}
                                                </button>
                                                <button onClick={() => openRenameModal(col)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                                    <IconPencil size={16} />
                                                    Changer le nom
                                                </button>
                                                <button onClick={() => openColorModal(col)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                                    <IconPalette size={16} />
                                                    Changer la couleur
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={() => openDeleteModal(col)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600">
                                                    <IconTrash size={16} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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

                {/* --- MODALES --- */}

                {/* 1. Rename Modal */}
                {modal.type === 'rename' && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <h3 className="text-lg font-bold mb-4">Renommer la collection</h3>
                            <input
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                className="w-full border p-2 rounded-lg mb-4 outline-none focus:ring-2 ring-indigo-500"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                                <button onClick={handleRename} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Enregistrer</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Color Modal */}
                {modal.type === 'color' && (
                    <div className="fixed inset-0 bg-black/50 z-5000 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <h3 className="text-lg font-bold mb-4">Choisir une couleur</h3>
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {colorOptions.map((opt) => (
                                    <button
                                        key={opt.name}
                                        onClick={() => setSelectedColor(opt.class)}
                                        className={`w-12 h-12 rounded-full ${opt.class} border-2 transition-all ${selectedColor === opt.class ? 'border-black scale-110' : 'border-transparent'}`}
                                        title={opt.name}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                                <button onClick={handleColorChange} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Appliquer</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Delete Modal */}
                {modal.type === 'delete' && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <h3 className="text-lg font-bold mb-2 text-red-600">Supprimer la collection ?</h3>
                            <p className="text-gray-600 mb-6 text-sm">Les posts contenus ne seront pas supprimés, mais ils ne seront plus classés dans ce groupe.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Supprimer</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SavedPosts;