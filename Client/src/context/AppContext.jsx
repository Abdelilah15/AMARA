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
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() =>{
        getAuthState();
    }, [])

    const value = {
        // Add global state values and functions here
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        isAuthChecking, setIsAuthChecking
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}