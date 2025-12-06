import { useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'




const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const {userData, backendUrl, setUserData, setIsLoggedin, setIsSidebarOpen } = useContext(AppContext)
    

  return (
<div className="z-10 fixed border-b border-gray-700 bg-gray-900 text-white w-full flex justify-between items-center p-4 sm:px-24 absolute top-0">
  
    {/* Partie Gauche : Logo + Bouton Mobile */}
    
    <div>
    {location.pathname === '/' ? (
      <i class="fi fi-tr-angle-small-left"></i>
      ): (

        <button></button>

      )}
      </div>

      {/* Partie Droite : Boutons Login/User */}
      {userData ? (
        <div 
            onClick={() => navigate(`/@${userData.username}`)}
            className=' w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer'>
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
