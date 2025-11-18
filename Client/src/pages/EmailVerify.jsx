import React from 'react'
import { assets } from '../assets/assets'

const EmailVerify = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.user} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      
      <form style={{borderRadius:"15px", padding:"10px"}} className= 'bg-slate-900 shadow-lg w-160 flex justify-center items-center text-indigo-300 text-sm'>
        <div style={{backgroundColor:"white", display:"flex", flexDirection:"row", borderRadius:"15px", justifyContent:"center", alignItems:"center"}}>

          <div style={{borderTopLeftRadius:"15px", borderBottomLeftRadius:"15px"}} className='hidden sm:block w-48 h-96 bg-white'>
            <img style={{width:"100%", height:"100%", borderRadius:"15px"}} className='' src={assets.téléchargement} alt="" />
          </div>
          <div style={{height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Verify Your Email</h2>
            <p style={{textAlign:"center"}} className='mb-8 max-w-md'>Please enter the OTP sent to your email address to verify your account and gain full access to our services.</p>
            
            <div className='flex justify-center mb-6'>
              {Array(6).fill(0).map((_, index) => (
                <input key={index} type="text" maxLength="1" required className='w-12 h-12 mx-1 text-center text-xl border border-gray-300 rounded' style={{fontSize:"25px",fontWeight:"bold" }} />
              ))}
            </div>

            <button type='submit' className='cursor-pointer border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transation-all'>Verify Email</button>
          </div>

        </div>
      </form>
    </div>
  )
}

export default EmailVerify
