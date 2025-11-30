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

    const getUserData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data')
            if(data.success) {
                setUserData(data.userData);
                // À chaque fois qu'on récupère les données d'un utilisateur connecté, on le sauvegarde/met à jour dans la liste
                saveAccountToList(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fonction interne pour sauvegarder le compte dans la liste locale
    const saveAccountToList = (user) => {
        setAccounts(prevAccounts => {
            // On vérifie si l'utilisateur existe déjà pour le mettre à jour
            const exists = prevAccounts.find(acc => acc.username === user.username);
            let newAccounts = [...prevAccounts];

            if (exists) {
                newAccounts = newAccounts.map(acc => acc.username === user.username ? user : acc);
            } else {
                // S'il n'existe pas, on l'ajoute
                newAccounts.push(user);
            }
            
            // Sauvegarde dans le localStorage
            localStorage.setItem('app_accounts', JSON.stringify(newAccounts));
            return newAccounts;
        });
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
        startAddAccount
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}