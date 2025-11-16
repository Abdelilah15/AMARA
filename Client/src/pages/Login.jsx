import { useContext, useState } from 'react'
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import "../index.css"
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./Login.css"




const Login = () => {

  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin } = useContext(AppContext);

  const [state, setstate] = useState('Sign Up')
  const [name, setName] = useState('') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === 'Sign Up') {
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})

        if(data.success){
          setIsLoggedin(true)
          navigate('/')
          toast.success("Registration Successful")
        }else {
          toast.error(data.message)
        }
      }else {
        const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})
        console.log('Réponse de l\'API Login:', data);

        if(data.success){
          setIsLoggedin(true)

          navigate('/');
        }else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.error(error); // Toujours bon de logguer l'erreur complète

    // CORRECTION : Utilisez "error.response.data.message" pour les erreurs Axios
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      // Message par défaut si l'API ne renvoie rien de propre
      toast.error('Une erreur inconnue est survenue.'); 
    }
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.user} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">{state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
        <p className="text-center text-small mb-3 text-gray-300">{state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}</p>
        
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-2.5 py-2 rounded-full bg-[#ffffff]'>
            <i className="fi fi-rr-user" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
            <input 
            onChange={e => setName(e.target.value)} value={name} 
            className="bg-transparent outline-none placeholder-gray-400 text-gray-900" type="text" placeholder="Full Name" required/>
          </div>
          )}
          
          <div className='mb-4 flex items-center gap-3 w-full px-2.5 py-2 rounded-full bg-[#ffffff]'>
            <i className="fi fi-rr-envelope" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
            <input onChange={e => setEmail(e.target.value)} value={email}
            className="bg-transparent outline-none placeholder-gray-400 text-gray-900" type="email" placeholder="Email id" required/>
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-2.5 py-2 rounded-full bg-[#ffffff]'>
            <i className="fi fi-rr-lock" style={{fontSize: "25px", color: "#777777ff", alignItems: "center", display: "flex", borderRadius: "50px", padding: "3px"}}></i>
            <input onChange={e => setPassword(e.target.value)} value={password} 
            className="bg-transparent outline-none placeholder-gray-400 text-gray-900" type="password" placeholder="Password" required/>
          </div>

          <p onClick={()=>navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">Forgot password?</p>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer">{state}</button>
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
