import { useContext, useState, useEffect } from 'react'
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css"
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./Login.css"




const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, isLoggedin, setIsLoggedin, getUserData, isAddingAccount, setIsAddingAccount, accounts } = useContext(AppContext);

  const [state, setstate] = useState('Sign Up')
  const [name, setName] = useState('') 
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  // --- NOUVEAU : Gérer les états initiaux venant de la navigation ---
  useEffect(() => {
    // Si on a passé un état via la navigation (ex: force "Login" ou "Sign Up")
    if (location.state?.initialState) {
        setstate(location.state.initialState);
    }
    // Si on a passé un email (pour le switch account)
    if (location.state?.email) {
        setEmail(location.state.email);
    }
  }, [location]);

  useEffect(() => {
    // Si connecté ET qu'on n'est PAS en train d'ajouter un compte, on redirige vers l'accueil.
    // Si on ajoute un compte, on reste sur la page Login.
    if (isLoggedin && !isAddingAccount) {
      navigate('/');
    }
  }, [isLoggedin, isAddingAccount, navigate]);


  const validatePassword = (password) => {
    if (state === 'Login') return;

    const minLength = /.{8,}/;
    const hasUpperCase = /[A-Z]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!password) {
      setPasswordFeedback('');
      setIsPasswordValid(false);
      return;
    }
    if (!minLength.test(password)) {
      setPasswordFeedback('Faible : 8 caractères minimum requis');
      setIsPasswordValid(false);
    }else if (!hasUpperCase.test(password)) {
      setPasswordFeedback('Moyen : Ajoutez une majuscule');
      setIsPasswordValid(false);
    } else if (!hasSpecialChar.test(password)) {
      setPasswordFeedback('Moyen : Ajoutez un caractère spécial');
      setIsPasswordValid(false);
    } else {
      setPasswordFeedback('Fort : Mot de passe valide');
      setIsPasswordValid(true);
    }
  }

  useEffect(() => {
    validatePassword(password);
  }, [password, state]);


  const onSubmitHandler = async (e) => {
    setLoading(true);
    try {
      e.preventDefault();

      // Vérification de la limite avant soumission (Double sécurité)
      // On vérifie si c'est un NOUVEAU compte (pas dans la liste actuelle)
      const isNewAccount = !accounts.some(acc => acc.email === email);
      if (isNewAccount && accounts.length >= 3) {
         toast.error("Limite de comptes atteinte (Max 3). Impossible d'en ajouter un nouveau.");
         setLoading(false);
         return;
      }

      if (state === 'Sign Up' && !isPasswordValid) {
        toast.error('Le mot de passe ne répond pas aux critères de sécurité.');
        return;
      }

      axios.defaults.withCredentials = true;

      if (state === 'Sign Up') {
        const {data} = await axios.post (backendUrl +'/api/auth/register', {
          name, username, email, password
        })
        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        }else {
          toast.error(data.message)
        }

      }else {
        const {data} = await axios.post (backendUrl + '/api/auth/login', {
          email, password
        })
        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          // IMPORTANT : On a fini d'ajouter un compte, on désactive le mode ajout
        if(isAddingAccount) {
            setIsAddingAccount(false); 
        }
        
        navigate('/');
      } else {
        toast.error(data.message);
      }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  // Si on est en mode "Ajouter un compte", on peut ajouter un bouton retour
  const handleCancelAdd = () => {
      setIsAddingAccount(false);
      navigate('/');
  };


  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img 
        onClick={isAddingAccount ? handleCancelAdd : ()=>navigate('/')} 
        src={assets.user} 
        alt="" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
        title={isAddingAccount ? "Annuler l'ajout" : "Retour à l'accueil"}
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {/* Titre dynamique */}
            {isAddingAccount 
                ? (state === 'Sign Up' ? 'Ajouter un compte' : 'Connexion autre compte') 
                : (state === 'Sign Up' ? 'Create Account' : 'Login')
            }
        </h2>
        <p className="text-center text-small mb-3 text-gray-300">{state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}</p>
        
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <>
            <div className='mb-4 flex items-center w-full pl-2.5 pr-1 py-1 rounded-full bg-[#ffffff]'>
              <i className="fi fi-rr-user" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
              <input 
                onChange={e => setName(e.target.value)} 
                value={name} 
                className='w-full rounded-full px-3 py-3 ml-1 bg-gray-200 outline-none placeholder-gray-400 text-gray-900' 
                type="text" 
                placeholder="Full Name" 
                required/>
            </div>
            <div className='mb-4 flex items-center w-full pl-2.5 pr-1 py-1 rounded-full bg-[#ffffff]'>
              <i class="fi fi-rr-at" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
              <input 
                onChange={e => setUsername(e.target.value)} 
                value={username} 
                className='w-full rounded-full px-3 py-3 ml-1 bg-gray-200 outline-none placeholder-gray-400 text-gray-900' 
                type="text" 
                placeholder="Username (ex: amara_fan)" 
                required />
            </div>
           </>
          )}
          
          <div className='mb-4 flex items-center w-full pl-2.5 pr-1 py-1 rounded-full bg-[#ffffff]'>
            <i className="fi fi-rr-envelope" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
            <input 
              onChange={e => setEmail(e.target.value)} 
              value={email}
              className='w-full rounded-full px-3 py-3 ml-1 bg-gray-200 outline-none placeholder-gray-400 text-gray-900'
              type="email" 
              placeholder="Email id" 
              required/>
          </div>
          <div className='mb-4 flex items-center w-full pl-2.5 pr-1 py-1 rounded-full bg-[#ffffff]'>
            <i className="fi fi-rr-lock" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
            <input 
              onChange={e => setPassword(e.target.value)} 
              value={password} 
              className='w-full rounded-full px-3 py-3 ml-1 bg-gray-200 outline-none placeholder-gray-400 text-gray-900' 
              type="password" 
              placeholder="Password" 
              required/>
          </div>

          {state === 'Sign Up' && passwordFeedback && (
            <p className={`text-xs mb-4 text-center ${isPasswordValid ? 'text-green-400' : 'text-red-400'}`}>
              {passwordFeedback}
            </p>
          )}
        
          <p onClick={()=>navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">Forgot password?</p>
          <button disabled={loading} className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer">{loading ? "Chargement..." : state}</button>
        </form>

        {state === 'Sign Up' ? 
        (<p style={{marginTop:"5px", color:"#9ca3af", textAlign:"center"}}>Already have an account?
          <span onClick={()=> setstate('Login')} style={{color:"#60a5fa", cursor:"pointer", textDecoration:"underline"}}> Login here</span>
        </p>) 
        : (<p style={{marginTop:"5px", color:"#9ca3af", textAlign:"center"}}>Don't have an account?
          <span onClick={()=> setstate('Sign Up')} style={{color:"#60a5fa", cursor:"pointer", textDecoration:"underline"}}> Sign up</span>
        </p>)} 
      </div>
    </div>
  )
}

export default Login
