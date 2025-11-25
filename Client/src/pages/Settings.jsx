import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const { userData, setUserData, backendUrl } = useContext(AppContext);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fonction pour changer le type
  const handleTypeChange = async (type) => {
    setLoading(true);
    try {
        const { data } = await axios.post(backendUrl + '/api/user/update-profile-type', { profileType: type });
        if (data.success) {
            setUserData(prev => ({ ...prev, profileType: type }));
            toast.success(data.message);
            setShowTypeModal(false);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  if (!userData) return <div className="p-6">Chargement...</div>;

  return (
    <div className='min-h-screen bg-gray-50 p-6 pt-24'>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Paramètres</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Compte</h2>
        
        {/* Option Type de Profil */}
        <div 
            onClick={() => setShowTypeModal(true)}
            className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200"
        >
            <div>
                <p className="font-medium text-gray-700">Type de profil</p>
                <p className="text-sm text-gray-500">Gérez votre identité sur la plateforme</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-blue-500 font-medium capitalize">{userData.profileType}</span>
                <span className="text-gray-400">›</span>
            </div>
        </div>

        {/* Autres options futures ici... */}
      </div>

      {/* --- MODALE (FENÊTRE) --- */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Choisissez votre type de profil</h3>
                <p className="text-gray-600 mb-6 text-sm">Le changement de type de profil peut affecter les outils auxquels vous avez accès.</p>

                <div className="space-y-3">
                    {/* Choix Personnel */}
                    <div 
                        onClick={() => handleTypeChange('personal')}
                        className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all ${userData.profileType === 'personal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div>
                            <p className="font-bold text-gray-800">Personnel</p>
                            <p className="text-xs text-gray-500">Pour une utilisation standard</p>
                        </div>
                        {userData.profileType === 'personal' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
                    </div>

                    {/* Choix Professionnel */}
                    <div 
                        onClick={() => handleTypeChange('professional')}
                        className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all ${userData.profileType === 'professional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div>
                            <p className="font-bold text-gray-800">Professionnel</p>
                            <p className="text-xs text-gray-500">Pour les créateurs et entreprises</p>
                        </div>
                        {userData.profileType === 'professional' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
                    </div>
                </div>

                <button 
                    onClick={() => setShowTypeModal(false)}
                    className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
                    disabled={loading}
                >
                    Annuler
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;