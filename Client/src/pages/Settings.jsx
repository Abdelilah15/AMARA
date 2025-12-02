import React, { useContext, useState, useEffect} from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Assurez-vous d'importer vos assets si besoin

const Settings = () => {
  const { userData, setUserData, backendUrl } = useContext(AppContext);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [username, setUsername] = useState('');
  const [profileType, setProfileType] = useState('personal' || 'professional');
  const [isUsernameChanged, setIsUsernameChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);

  useEffect(() => {
    if (userData) {
        setUsername(userData.username || '');
    }
  }, [userData]);

  // Gestion des inputs du mot de passe
  const handlePasswordInput = (e) => {
      const { name, value } = e.target;
      setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Nouvelle fonction pour gérer le changement de mot de passe
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/user/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            if (data.success) {
                toast.success(data.message);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
                setShowPasswordModal(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

  const handleUsernameInput = (e) => {
      const value = e.target.value;
      setUsername(value);
      setIsUsernameChanged(value !== userData.username);
  };

  // Fonction pour sauvegarder le nouveau username
  const handleSaveUsername = async () => {
    if (!username.trim()) return toast.error("Le nom d'utilisateur ne peut pas être vide");
    
    setLoading(true);
    try {
        const { data } = await axios.post(backendUrl + '/api/user/update-profile', { username });
        
        if (data.success) {
            setUserData(prev => ({ ...prev, username: username }));
            toast.success("Nom d'utilisateur mis à jour !");
            setIsUsernameChanged(false);
            setShowUsernameModal(false);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  // Fonction pour changer le type de profil
  const handleTypeChange = async (type) => {
    // Empêcher le clic si c'est déjà le type actif
    if (userData.profileType === type) return;

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

  // --- LOGIQUE CHANGEMENT EMAIL ---
  // Étape 1 : Envoyer l'OTP
  const handleSendEmailOtp = async () => {
    if (!newEmail.trim()) return toast.error("Veuillez entrer un email valide");
    if (newEmail === userData.email) return toast.error("C'est déjà votre email actuel");

    setLoading(true);
    try {
        const { data } = await axios.post(backendUrl + '/api/user/send-email-otp', { newEmail });
        if (data.success) {
            toast.success(data.message);
            setIsEmailOtpSent(true); // Passer à l'étape OTP
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  // Étape 2 : Vérifier l'OTP
  const handleVerifyEmailChange = async () => {
    if (!emailOtp.trim()) return toast.error("Veuillez entrer le code OTP");

    setLoading(true);
    try {
        const { data } = await axios.post(backendUrl + '/api/user/verify-new-email', { otp: emailOtp });
        if (data.success) {
            setUserData(prev => ({ ...prev, email: newEmail }));
            toast.success(data.message);
            // Reset states
            setShowEmailModal(false);
            setIsEmailOtpSent(false);
            setNewEmail('');
            setEmailOtp('');
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const closeEmailModal = () => {
      setShowEmailModal(false);
      setIsEmailOtpSent(false);
      setNewEmail('');
      setEmailOtp('');
  }

  if (!userData) return <div className="min-h-screen flex justify-center items-center bg-gray-50">Chargement...</div>;

  return (
    <div className='flex justify-center min-h-screen bg-gray-50 p-6 pt-24'>
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Paramètres</h1>

        {/* --- SECTION COMPTE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Compte</h2>
            <p className="text-gray-500 text-sm mt-1">Informations de connexion et identification</p>
          </div>
          
          <div className="p-2">
            {/* BOUTON POUR OUVRIR LA MODALE USERNAME */}
            <div 
                onClick={() => setShowUsernameModal(true)}
                className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group"
            >
                <div className="flex items-center gap-4">
                    {/* Icône @ */}
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                       <i className="fi fi-rr-at"></i>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Nom d'utilisateur</p>
                        <p className="text-sm text-gray-500">Votre identifiant unique (@{userData.username})</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm hidden sm:block">Modifier</span>
                    <img src={assets.arrow_small_right} alt="" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"/>
                </div>
            </div>

            {/* BOUTON POUR OUVRIR LA MODALE ADRESSE EMAIL */}
            <div 
                onClick={() => setShowEmailModal(true)}
                className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                       <i className="fi fi-rr-envelope"></i>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Adresse email</p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm hidden sm:block">Modifier</span>
                    <img src={assets.arrow_small_right} alt="" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"/>
                </div>
            </div>

            {/* BOUTON POUR OUVRIR LA MODALE PASSWORD */}
            <div 
                onClick={() => setShowPasswordModal(true)}
                className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                       {/* Utilisation d'une icône ou image générique pour le cadenas si assets.lock n'existe pas */}
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Mot de passe</p>
                        <p className="text-sm text-gray-500">••••••••••••</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm hidden sm:block">Modifier</span>
                    <img src={assets.arrow_small_right} alt="" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"/>
                </div>
            </div>

          </div>
        </div>

        {/* --- SECTION PRÉFÉRENCES --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Préférences</h2>
                <p className="text-gray-500 text-sm mt-1">Gérez vos préférences de profil</p>
            </div>
            
            <div className="p-2">
                {/* BOUTON POUR OUVRIR LA MODALE TYPE */}
                <div 
                    onClick={() => setShowTypeModal(true)}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                           <i className="fi fi-rr-user"></i>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Type de profil</p>
                            <p className="text-sm text-gray-500">Définir l'usage de votre compte</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            userData.profileType === 'professional' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                            {userData.profileType}
                        </span>
                        <img src={assets.arrow_small_right} alt="" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"/>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* --- MODALE 1 : USERNAME --- */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in relative overflow-hidden">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Changer de pseudo</h3>
                    <p className="text-gray-500 text-sm mt-2">Choisissez un nom unique pour votre profil.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau nom d'utilisateur</label>
                        <div className="relative">
                            <span className="absolute left-3 top-6 -translate-y-1/2 text-gray-400 font-medium">@</span>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="username"
                            />
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-xs flex gap-2 items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                                <p>Note : Vous ne pourrez changer votre nom d'utilisateur qu'une fois tous les 15 jours.</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 ml-1">Sera utilisé dans votre URL de profil.</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setShowUsernameModal(false)}
                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSaveUsername}
                        className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md shadow-indigo-200 disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALE 2 : EMAIL CHANGE (NOUVEAU) --- */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in relative overflow-hidden">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {isEmailOtpSent ? 'Vérification' : 'Changer d\'email'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                        {isEmailOtpSent 
                            ? `Entrez le code envoyé à ${newEmail}` 
                            : 'Entrez votre nouvelle adresse électronique.'}
                    </p>
                </div>

                <div className="space-y-4">
                    {!isEmailOtpSent ? (
                        // ÉTAPE 1 : Saisie de l'email
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouvel email</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <i className="fi fi-rr-envelope"></i>
                                </span>
                                <input 
                                    type="email" 
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="exemple@email.com"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">Un code de vérification sera envoyé à cette adresse.</p>
                        </div>
                    ) : (
                        // ÉTAPE 2 : Saisie de l'OTP
                        <div className='animate-fade-in'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification (OTP)</label>
                            <div className="flex justify-center gap-2 mb-4">
                                {/* Simple input pour l'OTP, peut être amélioré avec 6 cases distinctes */}
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="000000"
                                />
                            </div>
                            <div className="text-center">
                                <button 
                                    onClick={() => setIsEmailOtpSent(false)} 
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Modifier l'adresse email
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={closeEmailModal}
                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={!isEmailOtpSent ? handleSendEmailOtp : handleVerifyEmailChange}
                        className={`flex-1 py-2.5 px-4 text-white rounded-lg font-medium transition-colors shadow-md disabled:opacity-70 ${
                            isEmailOtpSent 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Traitement...' : (isEmailOtpSent ? 'Vérifier & Sauvegarder' : 'Envoyer le code')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALE 2 : PASSWORD --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in relative overflow-hidden">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Changer le mot de passe</h3>
                    <p className="text-gray-500 text-sm mt-2">Sécurisez votre compte avec un mot de passe fort.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                        <input 
                            type="password" 
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordInput}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                        <input 
                            type="password" 
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordInput}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordInput}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={() => { setShowPasswordModal(false); setPasswordData({oldPassword:'', newPassword:'', confirmPassword:''}) }} className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={loading}>Annuler</button>
                    <button onClick={handleChangePassword} className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md shadow-indigo-200 disabled:opacity-70" disabled={loading}>
                        {loading ? 'Modification...' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODALE 3 : TYPE DE PROFIL --- */}
      {showTypeModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in relative overflow-hidden">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Type de profil</h3>
                    <p className="text-gray-500 text-sm mt-2">Choisissez l'expérience qui vous convient le mieux.</p>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => handleTypeChange('personal')}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-200 group ${
                            userData.profileType === 'personal' 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 ring-offset-1' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userData.profileType === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <i className="fi fi-rr-user"></i>
                            </div>
                            <div>
                                <p className={`font-bold ${userData.profileType === 'personal' ? 'text-blue-700' : 'text-gray-700'}`}>Personnel</p>
                                <p className="text-xs text-gray-500">Pour lire et interagir</p>
                            </div>
                        </div>
                        {userData.profileType === 'personal' && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                    <button 
                        onClick={() => handleTypeChange('professional')}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-200 group ${
                            userData.profileType === 'professional' 
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 ring-offset-1' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                    >
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userData.profileType === 'professional' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <i className="fi fi-rr-briefcase"></i>
                            </div>
                            <div>
                                <p className={`font-bold ${userData.profileType === 'professional' ? 'text-purple-700' : 'text-gray-700'}`}>Professionnel</p>
                                <p className="text-xs text-gray-500">Pour créer et analyser</p>
                            </div>
                        </div>
                        {userData.profileType === 'professional' && (
                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                </div>
                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setShowTypeModal(false)}
                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;