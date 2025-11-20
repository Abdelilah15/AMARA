import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { userData, isLoggedin } = useContext(AppContext);
  const navigate = useNavigate();

  // Si l'utilisateur n'est pas connecté ou que les données chargent
  if (!userData && isLoggedin) {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400'>
            <p className='text-white text-xl'>Chargement du profil...</p>
        </div>
    );
  }

  // Si non connecté, rediriger (ou afficher message)
  if (!isLoggedin) {
      navigate('/login');
      return null;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      {/* Logo ou bouton retour */}
      <img 
        onClick={() => navigate('/')} 
        src={assets.logo || assets.user} // Fallback si assets.logo n'existe pas
        alt="Logo" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' 
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm animate-fade-in">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">Mon Profil</h2>

        <div className="flex flex-col items-center gap-4 mb-6">
            {/* Avatar de l'utilisateur */}
            <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-4xl text-white font-bold uppercase border-4 border-indigo-300">
                {userData.name ? userData.name[0] : 'U'}
            </div>
            
            <div className="text-center">
                <h3 className="text-xl font-bold text-white capitalize">{userData.name}</h3>
                <p className="text-gray-400">{userData.email}</p>
            </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h4 className="text-indigo-400 font-medium mb-2 border-b border-slate-700 pb-1">Statut du compte</h4>
            <div className="flex items-center gap-2 mt-2">
                {userData.isAccountVerified ? (
                    <>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-green-400">Email Vérifié</span>
                    </>
                ) : (
                    <>
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-red-400">Email Non Vérifié</span>
                    </>
                )}
            </div>
        </div>

        <button 
            onClick={() => navigate('/')}
            className="w-full py-2.5 mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
        >
            Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default Profile;