import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import '../index.css';
import { useContext } from 'react';
import AccountSwitcher from './AccountSwitcher';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';



const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(false);
  const { userData, setUserData, backendUrl, setIsLoggedin, isSidebarOpen, setIsSidebarOpen, startAddAccount } = useContext(AppContext);

  const logout = async () => {
        try {
          axios.defaults.withCredentials = true
          const {data} = await axios.post(backendUrl + '/api/auth/logout')
          data.success && setIsLoggedin(false)
          data.success && setUserData(false)
          navigate('/')
          toast.success('Déconnecté avec succès')
          setIsSidebarOpen(false);

        } catch (error) {
          toast.error(error.message)
        }
    };

  const handleNavigate = (path) => {
      navigate(path);
      setIsSidebarOpen(false);
    };

  const handleAddAccount = () => {
    // startAddAccount renvoie false si la limite est atteinte
    if (startAddAccount()) {
        navigate('/login');
    }
  };


  return (
    <>
      {/* --- Bouton Menu (Visible uniquement sur Mobile) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg"
      >
        {/* Icône Hamburger simple (SVG) */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* --- Overlay (Fond sombre quand le menu est ouvert sur mobile) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* --- Sidebar --- */}
      <div className={`
        border-r border-gray-700 fixed top-0 left-0 h-full w-84 bg-gray-900 text-white flex flex-col justify-between z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        
          {/* Logo / Header Sidebar */}
          <div className="w-full p-4 border-b border-gray-700 flex justify-between items-center">
            <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2">
                <img src={assets.user_robot} alt="Logo" className="w-8 h-8 bg-white rounded-full" />
                <span className="text-xl font-bold">AMARA</span>
            </div>
            {/* Bouton fermer (Visible uniquement sur mobile dans la sidebar) */}
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

        <div className='gap-2 flex flex-col w-full h-full justify-between p-4'>
        <div>
          {/* Navigation */}
          <ul className="space-y-4">
            <li onClick={() => { navigate('/'); setIsOpen(false); }} 
                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3">
                <img src={assets.house_chimney} className="w-5 invert"alt="" /> Accueil
            </li>

            <li 
              onClick={() => { navigate('/profile'); setIsOpen(false); }} 
                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3">
                <img src={assets.user} className="w-5 invert" alt="" /> Profil
            </li>
            
            <li onClick={() => { navigate('/settings'); setIsOpen(false); }} 
                className='hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3'>
                <img src={assets.settings} className="w-5 invert" alt="" /> Settings</li>
            {/* Ajoutez vos autres liens ici */}
          </ul>
        </div>

        {/* --- Section Utilisateur (Footer Sidebar) --- */}
        <div className="relative">
            
            {/* Menu Popup (S'affiche si showUserMenu est true) */}
            {showUserMenu && (
                <div style={{borderRadius:"25px"}} className="absolute bottom-20 left-0 w-full bg-gray-600 shadow-xl overflow-hidden mb-2 p-2">
                  <AccountSwitcher />
                </div>
            )}

        {/* Carte Utilisateur Cliquable */}
        <div 
            onClick={() => userData && setShowUserMenu(!showUserMenu)}
            className="bg-gray-600 p-2 rounded-full shadow-lg flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            {userData ? (
                <>
                {profileImage ? (
                  <div className="shrink-0 w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-4xl text-white font-bold uppercase border-3 border-indigo-300">
                    <img className="w-full h-full object-cover rounded-full" src={userData.image} alt="" />
                  </div>                
                ) : (
                  <div className="w-14 h-14 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-4xl text-white font-bold uppercase border-3 border-indigo-300">
                    {userData.name ? userData.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                  <div className="text-left min-w-0">
                    <h3 className="text-xl font-bold text-white capitalize">{userData.name}</h3>
                    <p className="text-gray-400 truncate">{userData.email}</p>
                  </div>
                </>
                ) : (
                <p>Utilisateur non connecté</p>
            )}
        </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;