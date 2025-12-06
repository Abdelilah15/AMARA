import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import CreatePostModal from '../components/CreatePostModal';


const Feed = () => {
  const { userData } = useContext(AppContext);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);


  return (
    <div className='min-h-screen bg-gray-900 text-white pb-20 relative'>
        <Navbar />
        
        <div className="p-4 pt-20">
            
        </div>

        {/* --- BOUTON CREATE FLOTTANT (Mobile) --- */}
        {/* md:hidden = Visible seulement sur mobile */}
        <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            
            {/* Menu qui s'ouvre */}
            {showMobileMenu && (
                <div className="flex flex-col gap-3 mb-2 transition-all animate-bounce-in">
                    {/* Article (Pro seulement) */}
                    {userData && userData.profileType === 'professional' && (
                        <button 
                            onClick={() => {setShowMobileMenu(false)}}
                            className="bg-purple-600 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                            <i class="fi fi-tr-document-signed flex"></i>
                        </button>
                    )}
                    
                    {/* Storie */}
                    <button 
                        onClick={() => setShowMobileMenu(false)}
                        className="bg-blue-500 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        <i class="fi fi-tr-camera flex"></i>
                    </button>

                    {/* Post */}
                    <button 
                        onClick={() => {
                            setShowMobileMenu(false);
                            setIsPostModalOpen(true);
                        }}
                        className="bg-green-500 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        <i class="fi fi-tr-photo-video flex"></i>
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
                <i style={{fontSize:"30px"}} className={`fi fi-ts-feather transition-transform duration-300 flex ${showMobileMenu ? 'rotate-45 scale-125' : ''}`}></i>
            </button>
        </div>
        
        <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

    </div>
  )
}

export default Feed