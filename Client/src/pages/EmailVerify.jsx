import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from 'react';



const EmailVerify = () => {

  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, getUserData, userData} = useContext(AppContext)
  const navigate = useNavigate()

  const inputRefs = React.useRef([])
  const handleInputChange = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  // Fonction pour gérer le collage du code complet
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text'); // Récupère le texte collé
    const pasteArray = paste.split('');            // Transforme en tableau de caractères
    
    pasteArray.forEach((char, index) => {
      // Si le champ existe (on ne dépasse pas 6), on le remplit
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp })
      if (data.success) {
        toast.success('Email verified successfully')
        getUserData() 
        navigate('/')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate('/')

  }, [isLoggedin, userData])


  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.user} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      
      <form onSubmit={onSubmitHandler} style={{borderRadius:"15px", padding:"10px"}} className= 'bg-slate-900 shadow-lg w-160 flex justify-center items-center text-indigo-300 text-sm'>
        <div style={{backgroundColor:"white", display:"flex", flexDirection:"row", borderRadius:"15px", justifyContent:"center", alignItems:"center", width:"100%"}}>

          <div style={{borderTopLeftRadius:"15px", borderBottomLeftRadius:"15px"}} className='hidden sm:block w-68 h-96 bg-white'>
            <img style={{width:"100%", height:"100%", borderRadius:"15px"}} className='' src={assets.téléchargement} alt="" />
          </div>
          <div style={{height:"100%", width:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", background:""}}>
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Verify Your Email</h2>
            <p style={{textAlign:"center"}} className='mb-8 max-w-md'>Entrez le code à 6 chiffres envoyé à votre adresse email.</p>
            
            <div className='flex justify-center mb-6'>
              {Array(6).fill(0).map((_, index) => (
                <input key={index} type="text" maxLength="1" required 
                className='w-12 h-12 mx-1 text-center text-xl border border-gray-300 rounded' style={{fontSize:"25px",fontWeight:"bold" }} 
                ref={el => inputRefs.current[index] = el}
                onInput={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e)}
                />
                
              ))}
            </div>

            <button type='submit' className='text-black cursor-pointer border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transation-all'>Verify Email</button>
          </div>

        </div>
      </form>
    </div>
  )
}

export default EmailVerify
