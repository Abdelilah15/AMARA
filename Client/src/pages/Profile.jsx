import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Assurez-vous que assets contient des icônes par défaut si besoin


const Profile = () => {
  const { userData, isLoggedin, getUserData, backendUrl, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  // États locaux pour gérer l'aperçu des images avant l'envoi au serveur
  // (Note: La logique d'upload vers le serveur devra être connectée ici)
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(false);

  // Mettre à jour les champs quand userData change ou quand on ouvre la modale
  useEffect(() => {
    if (userData) {
      setEditName(userData.name || '');
      setEditBio(userData.bio || '');
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/user/update-profile', {
        name: editName,
        bio: editBio
      });

      if (data.success) {
        setUserData(prev => ({ ...prev, name: editName, bio: editBio }));
        toast.success(data.message);
        setIsEditModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  if (!userData) return <div className="min-h-screen flex justify-center items-center">Chargement...</div>;

  // Fonction pour simuler le changement d'image (Aperçu)
const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Prévisualisation immédiate (UX)
    const imageUrl = URL.createObjectURL(file);
    if (type === 'profile') setProfileImage(imageUrl);
    if (type === 'banner') setBannerImage(imageUrl);

    // 2. Envoi au backend
    const formData = new FormData();
    // Le nom ici ('image' ou 'banner') doit correspondre à ce qu'on a mis dans userRoutes.js (upload.single('...'))
    formData.append(type === 'profile' ? 'image' : 'banner', file);

    try {
        // Déterminer l'endpoint
        const endpoint = type === 'profile' 
            ? '/api/user/upload-avatar' 
            : '/api/user/upload-banner';

        const { data } = await axios.post(backendUrl + endpoint, formData, {
            withCredentials: true,
        });

        if (data.success) {
            toast.success(data.message);
            // Optionnel : Mettre à jour le contexte global pour que l'image persiste si on change de page
            getUserData(); 
        } else {
            toast.error(data.message);
        }

    } catch (error) {
        console.error(error);
        toast.error("Erreur lors de l'upload");
    }
  };

  // Loading state
  if (!userData && isLoggedin) {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  // Redirection si non connecté
  if (!isLoggedin) {
      navigate('/login');
      return null;
  }

  return (
    // Container Principal : Centré sur desktop, fond gris clair
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center py-0 sm:py-10'>
      
      {/* Carte du Profil : Prend toute la largeur sur mobile (w-full), max-w-lg sur desktop, bords arrondis seulement sur desktop */}
      <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-300 animate-fade-in">
        
        {/* --- Zone Bannière --- */}
        <div className="relative h-40 sm:h-48 bg-gray-200 group">
            {/* Image de la bannière ou Dégradé par défaut */}
            {bannerImage || userData.banner ? (
                <img 
                    src={bannerImage || userData.banner} 
                    alt="Banner" 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            )}

            {/* Bouton Modifier Bannière (visible au survol) */}
            <label htmlFor="banner-upload" className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </label>
            <input type="file" id="banner-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} />
        </div>

        {/* --- Contenu du Profil --- */}
        <div className="px-6 pb-8 relative">
            
            {/* --- Zone Avatar (chevauche la bannière) --- */}
            <div className="relative -mt-16 mb-4 flex justify-center sm:justify-start">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-600 overflow-hidden shadow-lg flex items-center justify-center text-5xl text-white font-bold uppercase">
                        {profileImage || userData.image ? (
                            <img src={profileImage || userData.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userData.name ? userData.name[0] : 'U'
                        )}
                    </div>
                    
                    {/* Bouton Modifier Avatar */}
                    <label htmlFor="profile-upload" className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer border-2 border-white shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                    </label>
                    <input type="file" id="profile-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                </div>
            </div>

            {/* Informations Textuelles */}
            <div className="text-center sm:text-left mt-2">
                <h2 className="text-3xl font-bold text-gray-900 capitalize">{userData.name}</h2>
                <p className="text-gray-500 font-medium">{userData.email}</p>
            </div>

            {/* Statut du compte et Actions */}
            <div className="mt-8 grid grid-cols-1 gap-4">
                
                {/* Carte Statut */}
                <div className={`p-4 rounded-lg border-l-4 ${userData.isAccountVerified ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} flex items-center justify-between shadow-sm`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Statut du compte</p>
                        <p className={`text-lg font-bold ${userData.isAccountVerified ? 'text-green-700' : 'text-red-700'}`}>
                            {userData.isAccountVerified ? 'Vérifié' : 'Non Vérifié'}
                        </p>
                    </div>
                    <div className={`text-2xl ${userData.isAccountVerified ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fi ${userData.isAccountVerified ? 'fi-sr-check-circle' : 'fi-sr-cross-circle'}`}></i>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex-1 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Accueil
                    </button>
                    
                    {!userData.isAccountVerified && (
                        <button 
                            onClick={() => navigate('/email-verify')}
                            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Vérifier l'email
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;