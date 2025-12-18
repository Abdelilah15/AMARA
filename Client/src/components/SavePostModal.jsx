// Client/src/components/SavePostModal.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const SavePostModal = ({ isOpen, onClose, postId, onSaveSuccess }) => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const [newCollection, setNewCollection] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    // 1. On récupère les collections de l'utilisateur (ou tableau vide par défaut)
    const userCols = userData?.savedCollections || [];
    // 2. On filtre pour ne pas avoir "Général" en double si jamais il est dans la DB
    const customCols = userCols.filter(col => col !== 'Général');
    // 3. On construit la liste finale : Toujours "Général" en premier + les autres
    const displayCollections = ['Général', ...customCols];

    const handleSave = async (collectionName) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/save-post', {
                postId,
                collectionName
            });

            if (data.success) {
                toast.success(data.message);
                if (onSaveSuccess) onSaveSuccess(data.action); // 'saved' ou 'unsaved'
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollection.trim()) return;
        try {
            const { data } = await axios.post(backendUrl + '/api/user/create-collection', {
                collectionName: newCollection
            });
            if (data.success) {
                toast.success("Groupe créé !");
                await getUserData(); // Rafraîchir les données utilisateur pour avoir la nouvelle liste
                setNewCollection('');
                setIsCreating(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>            <div className="bg-white rounded-xl w-full max-w-sm p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Enregistrer dans...</h3>
                <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                    <i className="fi fi-rr-cross-small flex"></i>
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto mb-4 space-y-2 pr-1">
                {/* Liste des collections existantes */}
                {displayCollections.map((col, index) => {
                    const collectionName = typeof col === 'object' ? col.name : col;

                    return (
                        <button
                            key={index}
                            // CORRECTION ICI : On passe le nom (string) à la fonction, pas l'objet entier
                            onClick={() => handleSave(collectionName)}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex justify-between items-center group transition-colors"
                        >
                            {/* CORRECTION ICI : On affiche le nom (string) */}
                            <span className="font-medium text-gray-700">{collectionName}</span>
                            <i className="fi fi-rr-angle-small-right text-gray-400 group-hover:text-gray-600"></i>
                        </button>
                    );
                })}
            </div>

            {/* Section Créer nouveau groupe */}
            {!isCreating ? (
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full py-2 border border-gray-300 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 flex items-center justify-center gap-2"
                >
                    <i className="fi fi-rr-plus"></i> Nouveau groupe
                </button>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        placeholder="Nom du groupe..."
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                        autoFocus
                    />
                    <button
                        onClick={handleCreateCollection}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                    >
                        Créer
                    </button>
                </div>
            )}
        </div>
        </div>
    );
};

export default SavePostModal;