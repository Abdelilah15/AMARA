import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import "../index.css"
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'



const ResetPassword = () => {


    const {backendUrl} = useContext(AppContext)
    axios.defaults.withCredentials = true

    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [newPassword, setnewPassword] = useState('')
    const [isEmailSent, setIsEmailSent] = useState('')
    const [otp, setOtp] = useState(0)
    const [isOtpSubmited, setIsOtpSubmited] = useState(false)

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


  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
      if (data.success) {
        setIsEmailSent(true)
        toast.success('OTP sent to your email')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')
      const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {otp, newPassword})
      if (data.success) {
        toast.success('Password reset successfully')
        navigate('/login')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate('/')} src={assets.user} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
          
          {/* entrer l'email */}
{!isEmailSent &&
          <form onSubmit={onSubmitEmail} style={{borderRadius:"15px", paddingRight:"80px", paddingLeft:"80px", paddingTop:"20px", paddingBottom:"20px"}} className= 'bg-slate-900 shadow-lg w-160 flex flex-col justify-center items-center text-indigo-300 text-sm'>
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Reset Password</h2>
            <p style={{textAlign:"center"}} className='mb-8 max-w-md'>Enter your registred email address to reset your password.</p>
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"#ffffff", borderRadius:"50px", padding:"5px 10px", paddingRight:"5px", marginBottom:"20px"}} className='w-full'>
              <i style={{display:"flex",backgroundColor:"#ffffffff", justifyContent:"center", fontSize:"25px", color:"#777777ff", marginRight:"5px", marginLeft:"3px"}} class="fi fi-rr-envelope"></i>
              <input type="email" placeholder='Email Address' required
              className='w-full h-12 mx-1 px-4 text-black text-center text-xl rounded-full bg-gray-200 outline-none placeholder-gray-400' style={{fontSize:"18px"}} 
              value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className='bg-gray-200 text-black cursor-pointer border border-gray-500 rounded-full px-12 py-3 hover:bg-gray-100 transation-all'>Submit</button>
          </form>
}

          {/* enterer l'otp */}
{!isOtpSubmited && isEmailSent &&
          <form  style={{borderRadius:"15px", paddingRight:"80px", paddingLeft:"80px", paddingTop:"20px", paddingBottom:"20px"}} className= 'bg-slate-900 shadow-lg w-160 flex flex-col justify-center items-center text-indigo-300 text-sm'>
            <div style={{display:"flex", flexDirection:"row", borderRadius:"15px", justifyContent:"center", alignItems:"center", width:"100%"}}>
              <div style={{height:"100%", width:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", background:""}}>
                <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Reset password OTP</h2>
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
                <button type='submit' className='text-black cursor-pointer border border-gray-500 rounded-full px-8 py-2.5 bg-gray-200 hover:bg-gray-100 transation-all'>Submit</button>
              </div>
            </div>
          </form>
}   

          {/* new password */}
{!isOtpSubmited && isEmailSent &&
          <form style={{borderRadius:"15px", paddingRight:"80px", paddingLeft:"80px", paddingTop:"20px", paddingBottom:"20px"}} className= 'bg-slate-900 shadow-lg w-160 flex flex-col justify-center items-center text-indigo-300 text-sm'>
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>New password</h2>
            <p style={{textAlign:"center"}} className='mb-8 max-w-md'>Enter the new password for your account.</p>
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"#ffffff", borderRadius:"50px", padding:"5px 10px", paddingRight:"5px", marginBottom:"20px"}} className='w-full'>
              <i style={{display:"flex",backgroundColor:"#ffffffff", justifyContent:"center", fontSize:"25px", color:"#777777ff", marginRight:"5px", marginLeft:"3px"}} class="fi fi-rr-lock"></i>
              <input type="password" placeholder='New Password' required
              className='w-full h-12 mx-1 px-4 text-black text-center text-xl rounded-full bg-gray-200 outline-none placeholder-gray-400' style={{fontSize:"18px"}} 
              value={newPassword} onChange={e => setnewPassword(e.target.value)} />
              
            </div>
            <button className='bg-gray-200 text-black cursor-pointer border border-gray-500 rounded-full px-12 py-3 hover:bg-gray-100 transation-all'>Reset Password</button>
          
          </form>
}
    </div>
  )
}

export default ResetPassword
