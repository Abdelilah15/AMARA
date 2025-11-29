// Client/src/components/UserList.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserList = () => {
    const { backendUrl } = useContext(AppContext);
    const [users, setUsers] = useState([]); // Stocke la liste des gens
    const navigate = useNavigate();

    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/list');
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-10 p-4">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Communauté</h2>
            
            {/* Grille des cartes utilisateurs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {users.map((user, index) => (
                    <div 
                        key={index} 
                        // C'est ICI qu'on utilise le lien dynamique vers le profil
                        onClick={() => navigate(`/@${user.username}`)} 
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform flex flex-col items-center gap-3 shadow-lg"
                    >
                        {/* Image de profil ou Initiale */}
                        <div className="w-16 h-16 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl text-white font-bold">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                            )}
                        </div>
                        
                        {/* Infos texte */}
                        <div className="text-center">
                            <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                            <p className="text-gray-300 text-sm">@{user.username}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;