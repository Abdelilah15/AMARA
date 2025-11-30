import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AccountSwitcher = () => {
    const { accounts, userData, startAddAccount, setUserData } = useContext(AppContext);
    const navigate = useNavigate();

    // Action : Changer de compte
    const handleSwitch = (account) => {
        // Si on clique sur le compte déjà actif, on ne fait rien
        if (userData && account.username === userData.username) return;

        // On active le mode "Ajout/Switch"
        if (startAddAccount()) {
            // On va vers Login en forçant l'état 'Login' et en pré-remplissant l'email
            navigate('/login', { state: { initialState: 'Login', email: account.email } });
        }
    };

    // Action : Créer un nouveau compte
    const handleCreateNew = () => {
        // On active le mode "Ajout" (vérifie la limite de 3 comptes)
        if (startAddAccount()) {
            // On va vers Login en forçant l'état 'Sign Up' (Création)
            navigate('/login', { state: { initialState: 'Sign Up' } });
        }
    };

    const logout = async () => {
        try {
          axios.defaults.withCredentials = true
          const {data} = await axios.post(backendUrl + '/api/auth/logout')
          data.success && setIsLoggedin(false)
          data.success && setUserData(false)
          navigate('/')
          toast.success('Déconnecté avec succès')
          setIsSidebarOpen(false);

        } catch (error) {
          toast.error(error.message)
        }
    };

    return (
        <div className="w-full pt-2">
            
            {/* Titre discret */}
            {accounts.length > 0 && (
                <p className="text-xs text-gray-400 px-2 mb-2 uppercase font-semibold tracking-wider">
                    Mes Comptes ({accounts.length}/3)
                </p>
            )}

            {/* Liste des comptes enregistrés */}
            <div className="space-y-2 mb-3">
                {accounts.map((acc, index) => {
                    const isActive = userData && userData.username === acc.username;
                    return (
                        <div 
                            key={index} 
                            onClick={() => handleSwitch(acc)}
                            className={`flex items-center gap-3 p-2 pr-4 rounded-full cursor-pointer transition-all duration-200 group
                                ${isActive ? 'bg-indigo-900/30 border border-indigo-500/50' : 'hover:bg-gray-800 border border-gray-700'}
                            `}
                        >
                            {/* Avatar Miniature */}
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                                {acc.image ? <img src={acc.image} alt="" className="w-full h-full object-cover"/> : acc.name[0].toUpperCase()}
                            </div>
                            
                            {/* Infos Texte */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {acc.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">@{acc.username}</p>
                            </div>

                            {/* Indicateur Actif */}
                            {isActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                    );
                })}
            </div>

            {/* Bouton : Ajouter / Créer un compte */}
            {accounts.length < 3 ? (
                <button 
                    onClick={handleCreateNew}
                    className="w-full py-4 px-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors border border-dashed border-gray-400 hover:border-gray-400 cursor-pointer"
                >
                    <i className="fi fi-rr-plus-small text-lg flex justify-center"></i>
                    <span>Ajouter un compte</span>
                </button>
            ) : (
                <p className="text-xs text-center text-red-400/80 mt-2">
                    Limite de comptes atteinte
                </p>
            )}

            <button 
                className="mt-3 w-full text-center px-3 py-4 hover:bg-red-900/30 text-sm text-red-400 hover:text-red-300 transition-colors border rounded-full border-red cursor-pointer"
                onClick={logout}
                >Se déconnecter
            </button>

        </div>
    );
};

export default AccountSwitcher;