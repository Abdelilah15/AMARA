import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreatePostModal from '../components/CreatePostModal';
import PostItem from '../components/PostItem';
import { assets } from '../assets/assets'; // Assurez-vous que assets contient des icônes par défaut si besoin


const Profile = () => {
  const { userData, isLoggedin, backendUrl, setUserData, isAuthChecking, globalNewPost, setGlobalNewPost } = useContext(AppContext);
  const navigate = useNavigate();
  const { username } = useParams();

  // États locaux pour gérer l'aperçu des images avant l'envoi au serveur
  // (Note: La logique d'upload vers le serveur devra être connectée ici)
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLinks, setEditLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posts, setPosts] = useState([]);

  const isOwnProfile = userData && profileData && userData.username === profileData.username;

  const fetchUserProfile = async () => {
    try {
      // Note: on enlève le '@' s'il est présent dans le paramètre
      const cleanUsername = username.replace('@', '');
      const { data } = await axios.get(backendUrl + '/api/user/' + cleanUsername);

      if (data.success) {
        setProfileData(data.userData);
      } else {
        toast.error("Utilisateur introuvable");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si pas d'username dans l'URL, c'est mon profil (route /profile)
    if (!username) {
      if (userData) {
        setProfileData(userData);
      }
    }
    // Si un username est dans l'URL
    else if (username) {
      if (userData && (username === userData.username || username === '@' + userData.username)) {
        // L'URL contient mon propre nom d'utilisateur
        setProfileData(userData);
      } else {
        // C'est quelqu'un d'autre, on charge ses données
        fetchUserProfile();
      }
    }
  }, [username, userData, backendUrl]);

  const handleCopyLink = () => {
    const profileUrl = window.location.href; // Récupère l'URL actuelle
    navigator.clipboard.writeText(profileUrl);
    setShowMenu(false); // Ferme le menu
    toast.success('Lien copié !');
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
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

  // Mettre à jour les champs quand userData change ou quand on ouvre la modale
  useEffect(() => {
    if (userData && isOwnProfile) {
      setEditName(userData.name || '');
      setEditBio(userData.bio || '');
      setEditLinks(userData.links || []);
    }
  }, [userData, isOwnProfile]);

  // Redirect to login when not authenticated
  useEffect(() => {
    if (!isLoggedin && !username) {
      // Si pas de username (route /me) et pas connecté -> login
      navigate('/login');
    }
    // Si il y a un username (profil public), on laisse passer même si pas connecté (optionnel, selon votre choix)
  }, [isLoggedin, navigate, isAuthChecking, username]);

  useEffect(() => {
      // On ne l'ajoute que si c'est MON profil (sinon ça n'a pas de sens d'afficher mon nouveau post sur le profil de quelqu'un d'autre)
      const isMyProfile = profileData && userData && (profileData._id === userData._id);

      if (globalNewPost && isMyProfile) {
          setUserPosts((prev) => [globalNewPost, ...prev]);
          setGlobalNewPost(null); // On vide le tampon
      }
  }, [globalNewPost, setGlobalNewPost, profileData, userData]);

  // Gestion des changements dans les inputs de liens
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...editLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditLinks(newLinks);
  };

  const handleAddLink = () => {
    if (editLinks.length < 3) {
      setEditLinks([...editLinks, { title: '', url: '' }]);
    }
  };

  const handleRemoveLink = (indexToRemove) => {
    setEditLinks(editLinks.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const filteredLinks = editLinks.filter(link => link.title.trim() !== '' && link.url.trim() !== '');
      const { data } = await axios.post(backendUrl + '/api/user/update-profile', {
        name: editName,
        bio: editBio,
        links: filteredLinks
      });

      if (data.success) {
        // Update local context with new fields
        setUserData(prev => ({ ...prev, name: editName, bio: editBio, links: filteredLinks }));
        setProfileData(prev => ({ ...prev, name: editName, bio: editBio, links: filteredLinks }));
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

  const fetchUserPosts = async (id) => { // [!code ++] Accepte l'ID en paramètre
    try {
      const targetId = id || (profileData && profileData._id); // Sécurité
      if (!targetId) return; // Si pas d'ID, on arrête

      const { data } = await axios.get(backendUrl + '/api/post/user/' + targetId);
      if (data.success) {
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // --- USE EFFECT POUR DÉCLENCHER LE CHARGEMENT DES POSTS ---
  useEffect(() => {
    // On ne lance la requête que si on a un ID valide
    if (profileData && profileData._id) {
      fetchUserPosts(profileData._id);
    }
  }, [profileData?._id]);

  // If user is logged in but user data not yet loaded, show loader
  if (isLoggedin && !userData) return <div className="min-h-screen flex justify-center items-center">Chargement...</div>;
  if (!profileData) return <div className="text-white text-center mt-20">Profil introuvable</div>;

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
        // If API returned updated user object, merge it into context so UI updates
        if (data.user) {
          setUserData(data.user);
          setProfileData(data.user)
        }
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'upload");
    }
  };

  // Loading state
  if (!profileData) {
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

  const handlePostCreation = async (newPost) => {
    // 1) Mise à jour instantanée de l'UI (si newPost contient les champs attendus)
    if (newPost) {
      const postWithUserInfo = { ...newPost, userId: userData };
      setUserPosts(prev => [postWithUserInfo, ...prev]);
    }

    // 2) Recharger la liste depuis l'API pour assurer la cohérence
    if (profileData?._id) {
      await fetchUserPosts(profileData._id);
    }
  };

  const removePostFromList = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    // Container Principal : Centré sur desktop, fond gris clair
    <div className='mt-16 min-h-screen flex flex-col items-center justify-start bg-gray-50'>

      {/* ======== Carte du Profil ======== */}
      <div className="w-full max-w-3xl mx-auto border border-gray-700">

        {/* --- Zone Bannière --- */}
        <div className="relative h-40 sm:h-48 bg-gray-200 group">
          {/* Image de la bannière ou Dégradé par défaut */}
          {bannerImage || profileData.banner ? (
            <img
              src={bannerImage || profileData.banner}
              alt="Banner"
              className="w-full h-full object-cover"
              onClick={() => setImageModal(bannerImage || profileData.banner)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
          )}

          {/* Bouton Modifier Bannière (visible au survol) */}
          {isOwnProfile && (
            <>
              <label htmlFor="banner-upload" className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </label>
              <input type="file" id="banner-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} />
            </>
          )}
        </div>

        {/* --- Contenu du Profil --- */}
        <div className="px-6 pb-8 relative">

          {/* --- Zone Avatar (chevauche la bannière) --- */}
          <div className="relative -mt-16 mb-4 flex justify-center sm:justify-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-600 overflow-hidden shadow-lg flex items-center justify-center text-5xl text-white font-bold uppercase">
                {profileImage || profileData.image ? (
                  <img src={profileImage || profileData.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onClick={() => setImageModal(profileImage || profileData.image)}
                  />
                ) : (
                  profileData.name ? profileData.name[0] : 'U'
                )}
              </div>

              {/* Bouton Modifier Avatar */}
              {isOwnProfile && (
                <>
                  <label htmlFor="profile-upload" className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer border-2 border-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </label>
                  <input type="file" id="profile-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                </>
              )}
            </div>

            <div style={{ marginLeft: "auto", marginTop: "auto", }}>

              {/* --- Bouton Modifier le profil --- */}
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-10 py-2 border border-gray-300 rounded-full text-gray-700 font-medium transition-colors flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                  title="Modifier le profil"
                > <i className="fi fi-ts-user-pen flex"></i>
                </button>
              )}
            </div>

            {/* --- NOUVEAU : BOUTON 3 POINTS ET MENU --- */}
            <div className="relative mt-auto ml-1">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
              >
                {/* Icône 3 points verticale */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>

              </button>

              {/* Le Menu Déroulant (s'affiche si showMenu est true) */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    {/* Icône Lien */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Copier le lien
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Informations Textuelles */}
          <div className="text-left sm:text-left mt-2">
            <h2 className="text-3xl font-bold text-gray-900 capitalize">
              {profileData.name}
            </h2>
            <p className="text-indigo-600 font-medium mb-1">@{profileData.username}</p>
            {/* --- Affichage de la Bio --- */}
            <div className="mt-3 text-gray-600 text-sm leading-relaxed">
              {profileData.bio ? (
                <p className="whitespace-pre-wrap">{profileData.bio}</p>
              ) : (
                <p className="italic text-gray-400 text-xs">Aucune bio pour le moment.</p>
              )}
            </div>
            {/* --- AJOUT : DATE D'INSCRIPTION --- */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              {/* Icône calendrier (optionnelle, style cohérent avec votre projet) */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span>
                A rejoint en {new Date(userData.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* --- NOUVEAU : AFFICHAGE DES LIENS --- */}
            {profileData.links && profileData.links.length > 0 && (
              <div className="mt-4 flex flex-wrap sm:justify-start gap-2">
                {profileData.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                    {link.title || 'Lien'}
                  </a>
                ))}
              </div>
            )}
            {/* -------------------------------------- */}
          </div>

          {/* Statut du compte et Actions */}
          {isOwnProfile && (
            <div className="mt-8 grid grid-cols-1 gap-4">
              {/* Alerte Email non vérifié */}
              {!profileData.isAccountVerified && (
                <div className="p-4 rounded-lg border-l-4 bg-red-50 border-red-500 flex items-center justify-between shadow-sm animate-pulse">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Action requise</p>
                    <p className="text-lg font-bold text-red-700">
                      Email Non Vérifié
                    </p>
                  </div>
                  <div className="text-2xl text-red-500">
                    <i className="fi fi-sr-cross-circle"></i>
                  </div>
                </div>
              )}

              {/* Bouton de vérification */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {!profileData.isAccountVerified && (
                  <button
                    onClick={sendVerificationOtp}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md shadow-indigo-200"
                  >
                    Vérifier l'email maintenant
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- SECTION POSTS DU PROFIL --- */}
        <div className="flex justify-between px-10 py-2 border-t border-gray-200">
          <div>Avtivite</div>
          <div>Post</div>

          {userData && userData.profileType === 'professional' && (
            <div>Articles</div>
          )}

          <div>Stories</div>
          <div>Replyes</div>
        </div>

        <div className="border-t border-gray-200 min-h-[200px]">

          {/* CAS 1 : CHARGEMENT EN COURS */}
          {loadingPosts ? (
            <div className="flex justify-center items-center h-40 space-x-2">
              {/* Point 1 */}
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              {/* Point 2 */}
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              {/* Point 3 */}
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 pb-6 mt-4">
              {userPosts.map((post) => (
                <PostItem
                  key={post._id}
                  post={post}
                  onDelete={removePostFromList}
                />
              ))}
            </div>
          ) : (
            /* CAS 3 : AUCUN POST */
            <div className="text-center py-10 text-gray-500">
              <p>Aucune publication pour le moment.</p>
            </div>
          )}
        </div>

      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostCreation} // <-- Utilisez la nouvelle fonction ici
      />

      {/* --- MODALE D'EDITION MISE À JOUR --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 py-2 px-4 border-b border-gray-300">
              <h3 className="text-2xl font-bold text-gray-800">Modifier le profil</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4 px-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border-b border-gray-300 rounded-lg outline-none"
                  placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full overflow-hidden scrollbar-hide pl-3 border-b border-gray-300 outline-none resize-none"
                  placeholder="Votre bio..."
                  maxLength={150} />
                <p className="text-xs text-gray-400 mt-1">{editBio.length}/150 caractères max</p>
              </div>

              {/* SECTION LIENS DANS LA MODALE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liens ({editLinks.length}/3)
                </label>

                {/* Boucle dynamique sur le tableau editLinks */}
                {editLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">

                    {/* Input Titre */}
                    <input
                      type="text"
                      placeholder="Titre (ex: Portfolio)"
                      className="w-1/3 p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      value={link.title || ''}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    />

                    {/* Input URL */}
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      value={link.url || ''}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    />

                    {/* Bouton Supprimer (Icône Poubelle) */}
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer ce lien"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Bouton Ajouter (Visible seulement si moins de 3 liens) */}
                {editLinks.length < 3 && (
                  <button
                    onClick={handleAddLink}
                    className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un autre lien
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-gray-300 py-2 px-4">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={loading}>Annuler</button>
              <button onClick={handleSaveProfile} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-70">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOUVEAU : LA MODALE D'IMAGE (LIGHTBOX) --- */}
      {imageModal && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setImageModal(null)} // Ferme quand on clique sur le fond noir
        >
          {/* Bouton Fermer */}
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
            onClick={() => setImageModal(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* L'image en grand */}
          <img
            src={imageModal}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-scale-in cursor-default"
            onClick={(e) => e.stopPropagation()} // Empêche de fermer si on clique sur l'image elle-même
          />
        </div>
      )}

    </div>
  );
};

export default Profile;