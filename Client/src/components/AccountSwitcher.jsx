import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AccountSwitcher = () => {
    const { accounts, userData, startAddAccount, switchAccountSession, getUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSwitch = async (account) => {
        if (userData && account.username === userData.username) return;
        if (loading) return;

        setLoading(true);

        // 1. Vérifier si le token existe et s'il est valide (moins de 7 jours)
        const isValidSession = account.token && account.tokenExpiry && Date.now() < account.tokenExpiry;

        if (isValidSession) {
            // 2. Tenter la connexion automatique via le backend
            const success = await switchAccountSession(account.token);
            
            if (success) {
                // Si succès, on rafraîchit les données de l'utilisateur actif
                await getUserData();
                toast.success(`Connecté en tant que ${account.name}`);
                navigate('/'); // Assurer d'être sur la home ou recharger la page courante
                window.location.reload(); // Souvent nécessaire pour bien recharger le contexte global avec le nouveau cookie
            } else {
                // Si échec (token invalide côté serveur), redirection login
                redirectToLogin(account);
            }
        } else {
            // 3. Expiré ou pas de token -> redirection login
            redirectToLogin(account);
        }
        setLoading(false);
    };

    const redirectToLogin = (account) => {
        if (startAddAccount()) {
            navigate('/login', { state: { initialState: 'Login', email: account.email } });
        }
    };

    const handleCreateNew = () => {
        if (startAddAccount()) {
            navigate('/login', { state: { initialState: 'Sign Up' } });
        }
    };

    return (
        <div className="mt-auto w-full border-t border-gray-700 pt-4">
            {accounts.length > 0 && (
                <p className="text-xs text-gray-400 px-2 mb-2 uppercase font-semibold tracking-wider">
                    Mes Comptes ({accounts.length}/3)
                </p>
            )}

            <div className="space-y-2 mb-3">
                {accounts.map((acc, index) => {
                    const isActive = userData && userData.username === acc.username;
                    return (
                        <div 
                            key={index} 
                            onClick={() => handleSwitch(acc)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 group
                                ${isActive ? 'bg-indigo-900/30 border border-indigo-500/50' : 'hover:bg-gray-800 border border-transparent'}
                                ${loading ? 'opacity-50 cursor-wait' : ''}
                            `}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                                {acc.image ? <img src={acc.image} alt="" className="w-full h-full object-cover"/> : acc.name[0].toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {acc.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">@{acc.username}</p>
                            </div>

                            {isActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                    );
                })}
            </div>
            {/* ... Bouton Ajouter un compte ... */}
             {accounts.length < 3 ? (
                <button 
                    onClick={handleCreateNew}
                    className="w-full py-2 px-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-dashed border-gray-600 hover:border-gray-400"
                >
                    <i className="fi fi-rr-plus-small text-lg"></i>
                    <span>Ajouter un compte</span>
                </button>
            ) : (
                <p className="text-xs text-center text-red-400/80 mt-2">
                    Limite de comptes atteinte
                </p>
            )}
        </div>
    );
};

export default AccountSwitcher;