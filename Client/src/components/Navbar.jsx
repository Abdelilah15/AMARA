import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'




const Navbar = () => {
    const navigate = useNavigate()
    const {userData, backendUrl, setUserData, setIsLoggedin, setIsSidebarOpen } = useContext(AppContext)
    const sendVerificationOtp = async () => {
      try {
        axios.defaults.withCredentials = true
        const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
        if (data.success) {
          navigate('/email-verify')
          toast.success('Verification OTP sent to your email')
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(data.message)
      }
    }

    const logout = async () => {
      try {
        axios.defaults.withCredentials = true
        const {data} = await axios.post(backendUrl + '/api/auth/logout')
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        navigate('/')
        toast.success('Logged out successfully')

      } catch (error) {
        toast.error(error.message)
      }
    }

  return (
<div className="border-b border-gray-700 bg-gray-900 text-white w-full flex justify-between items-center p-4 sm:px-24 absolute top-0">
  
    {/* Partie Gauche : Logo + Bouton Mobile */}
      <div className="flex items-center gap-4">
        {/* --- NOUVEAU : Bouton pour ouvrir la Sidebar (Visible sur Mobile uniquement) --- */}
        <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div>
            
        </div>
      </div>

      {/* Partie Droite : Boutons Login/User */}
      {userData ? (
        <div 
            onClick={() => navigate('/profile')}
            className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer'>
            {userData.name[0].toUpperCase()}
            {/* Note: Le menu déroulant utilisateur peut rester ici ou dans la Sidebar selon votre choix */}
        </div>
      ) : (
        <button onClick={() => navigate('/login')} 
            className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'>
            Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
  
</div>

  )
}

export default Navbar
