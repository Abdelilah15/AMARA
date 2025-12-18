import { createContext, useState } from "react";
import axios from "axios";
import { toast} from 'react-toastify';
import { useEffect } from "react";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(true)
    const [userData, setUserData] = useState(false)
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [accounts, setAccounts] = useState(() => {
        const saved = localStorage.getItem('app_accounts');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [globalNewPost, setGlobalNewPost] = useState(null);
    const [mediaModalData, setMediaModalData] = useState(null);
    const [saveModalData, setSaveModalData] = useState({ isOpen: false, postId: null });

    const handleLogout = async (navigate) => {
        try {
            // 1. Identifier l'utilisateur actuel à retirer
            const currentUsername = userData?.username;
            
            // 2. Filtrer la liste pour retirer le compte actuel
            const remainingAccounts = accounts.filter(acc => acc.username !== currentUsername);
            
            // 3. Mettre à jour le state et le localStorage immédiatement
            setAccounts(remainingAccounts);
            localStorage.setItem('app_accounts', JSON.stringify(remainingAccounts));

            // 4. Appeler le backend pour nettoyer le cookie actuel
            await axios.post(backendUrl + '/api/auth/logout');

            // 5. Vérifier s'il reste des comptes valides
            if (remainingAccounts.length > 0) {
                // On prend le premier compte disponible
                const nextAccount = remainingAccounts[0];
                
                // On tente de se connecter avec son token sauvegardé
                if (nextAccount.token) {
                    const switchSuccess = await switchAccountSession(nextAccount.token);
                    if (switchSuccess) {
                        toast.success(`Basculé vers ${nextAccount.name}`);
                        await getUserData(); // Charger les données du nouveau compte
                        navigate('/'); // Rediriger vers l'accueil
                        return; // On s'arrête là, pas de déconnexion totale
                    }
                }
            }

            // 6. Si aucun compte restant ou échec du switch : Déconnexion totale
            setIsLoggedin(false);
            setUserData(false);
            setIsSidebarOpen(false);
            navigate('/login');
            toast.success('Déconnecté de tous les comptes');

        } catch (error) {
            toast.error(error.message);
            // En cas d'erreur critique, on force la sortie
            setIsLoggedin(false);
            navigate('/login');
        }
    };

    const getAuthState = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if (data.success) {
                setIsLoggedin(true)
                getUserData()
            }else {
                setIsLoggedin(false);
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsAuthChecking(false);
        }
    }

    const getUserData = async (tokenToSave = null) => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data')
            if(data.success) {
                setUserData(data.userData);
                // À chaque fois qu'on récupère les données d'un utilisateur connecté, on le sauvegarde/met à jour dans la liste
                saveAccountToList(data.userData, tokenToSave);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const openSaveModal = (postId, callback = null) => {
        setSaveModalData({ isOpen: true, postId, callback });
    };

    const closeSaveModal = () => {
        setSaveModalData({ ...saveModalData, isOpen: false });
    };

    // Fonction interne pour sauvegarder le compte dans la liste locale
    const saveAccountToList = (user, token) => {
        setAccounts(prevAccounts => {
            // On vérifie si l'utilisateur existe déjà pour le mettre à jour
            const exists = prevAccounts.find(acc => acc.username === user.username);
            let newAccounts = [...prevAccounts];

            const accountData = {
                ...user,
                // Si un token est fourni (connexion manuelle), on le met à jour avec l'expiration
                // Sinon, on garde l'ancien token s'il existe
                token: token || (exists ? exists.token : null),
                tokenExpiry: token ? (Date.now() + 7 * 24 * 60 * 60 * 1000) : (exists ? exists.tokenExpiry : null)
            };

            if (exists) {
                newAccounts = newAccounts.map(acc => acc.username === user.username ? accountData : acc);
            } else {
                // S'il n'existe pas, on l'ajoute
                newAccounts.push(user);
            }
            
            // Sauvegarde dans le localStorage
            localStorage.setItem('app_accounts', JSON.stringify(newAccounts));
            return newAccounts;
        });
    };

    // Nouvelle fonction pour le switch automatique
    const switchAccountSession = async (token) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/switch-login', { token });
            return data.success;
        } catch (error) {
            console.error("Switch error", error);
            return false;
        }
    };

    // Fonction pour démarrer le processus d'ajout de compte
    const startAddAccount = () => {
        // La limite est de 3 comptes au total (1 principal + 2 supplémentaires)
        if (accounts.length >= 3) {
            toast.error("Vous avez atteint la limite de 3 comptes sur cet appareil.");
            return false;
        }
        setIsAddingAccount(true);
        return true;
    };

    useEffect(() =>{
        getAuthState();
    }, [])

    const value = {
        // Add global state values and functions here
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        isAuthChecking, setIsAuthChecking,
        isSidebarOpen, setIsSidebarOpen,
        accounts, 
        isAddingAccount, setIsAddingAccount,
        startAddAccount,
        switchAccountSession,
        handleLogout,
        globalNewPost, setGlobalNewPost,
        mediaModalData, setMediaModalData,
        saveModalData, openSaveModal, closeSaveModal

    }


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}