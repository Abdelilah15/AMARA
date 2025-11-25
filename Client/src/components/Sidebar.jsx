import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import '../index.css';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile
  const { userData} = useContext(AppContext);


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
        fixed top-0 left-0 h-full w-84 bg-gray-900 text-white p-5 flex flex-col justify-between z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        <div>
          {/* Logo / Header Sidebar */}
          <div className="flex justify-between items-center mb-10">
            <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2">
                <img src={assets.user_robot} alt="Logo" className="w-8 h-8 bg-white rounded-full" />
                <span className="text-xl font-bold">AMARA</span>
            </div>
            {/* Bouton fermer (Visible uniquement sur mobile dans la sidebar) */}
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Navigation */}
          <ul className="space-y-4">
            <li 
              onClick={() => { navigate('/profile'); setIsOpen(false); }} 
                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3">
                <img src={assets.user} className="w-5 invert" alt="" /> Profil
            </li>
            <li onClick={() => { navigate('/'); setIsOpen(false); }} 
                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3">
                <img src={assets.house_chimney} className="w-5 invert"alt="" /> Accueil
            </li>
            <li onClick={() => { navigate('/settings'); setIsOpen(false); }} 
                className='hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center gap-3'>
                <img src={assets.settings} className="w-5 invert" alt="" /> Settings</li>
            {/* Ajoutez vos autres liens ici */}
          </ul>
        </div>

        <div className="bg-gray-600 p-2 rounded-full shadow-lg flex items-center gap-2 text-sm text-gray-400">
            {userData ? (
                <>
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-4xl text-white font-bold uppercase border-3 border-indigo-300">
                    {userData.name ? userData.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                    <h3 className="text-xl font-bold text-white capitalize">{userData.name}</h3>
                    <p className="text-gray-400">{userData.email}</p>
                </div>
                </>
            ) : (
                <p>Utilisateur non connecté</p>
            )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;