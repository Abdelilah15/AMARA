import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';

const Feed = () => {
  const { userData } = useContext(AppContext);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className='min-h-screen bg-gray-900 text-white pb-20 relative'>
        <Navbar />
        
        <div className="p-4 pt-20">
            <h1 className="text-2xl font-bold mb-4">Mon Feed</h1>
            <p className="text-gray-400">Contenu du feed ici (Posts, Stories...)</p>
            {/* Ici tu peux importer et afficher <UserList /> ou autre composant de contenu */}
        </div>

        {/* --- BOUTON CREATE FLOTTANT (Mobile) --- */}
        {/* md:hidden = Visible seulement sur mobile */}
        <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            
            {/* Menu qui s'ouvre */}
            {showMobileMenu && (
                <div className="flex flex-col gap-3 mb-2 transition-all animate-bounce-in">
                    {/* Article (Pro seulement) */}
                    {userData && userData.isProfessional && (
                        <button className="bg-purple-600 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                            📰
                        </button>
                    )}
                    
                    {/* Storie */}
                    <button className="bg-blue-500 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        📸
                    </button>

                    {/* Post */}
                    <button className="bg-green-500 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        📝
                    </button>
                </div>
            )}

            {/* Le Gros Bouton Carré Principal */}
            <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{backgroundColor: "#00ff73ff"}}
                className="w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center text-gray-800 transition-transform active:scale-95"
            >
                {/* Icône qui change si ouvert/fermé */}
                <i style={{fontSize:"30px"}} className={`fi fi-ts-feather transition-transform duration-300 ${showMobileMenu ? 'rotate-45 scale-125' : ''}`}></i>
            </button>
        </div>
    </div>
  )
}

export default Feed