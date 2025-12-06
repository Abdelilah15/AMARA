import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import CreatePostModal from '../components/CreatePostModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const Feed = () => {
  const navigate = useNavigate()
  const { userData, backendUrl } = useContext(AppContext);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);


  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPosts = async () => {
    try {
        const { data } = await axios.get(backendUrl + '/api/post/all');
        if (data.success) {
            setPosts(data.posts);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
      setIsPostModalOpen(false);
      fetchPosts(); // Recharge la liste
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white pb-20 relative'>
        <Navbar />
        
        {/* --- ZONE D'AFFICHAGE DES POSTS --- */}
        <div className="p-4 pt-24 max-w-2xl mx-auto flex flex-col gap-6">
            
            {loading ? (
                <p className="text-center text-gray-400">Chargement des posts...</p>
            ) : posts.length === 0 ? (
                <p className="text-center text-gray-400">Aucun post pour le moment.</p>
            ) : (
                posts.map((post) => (
                    <div key={post._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
                        {/* Header du post */}
                        <div 
                            className="flex items-center gap-3 mb-3">
                            <img 
                                onClick={()=> navigate(`/@${post.userId?.username}`)}
                                src={post.userId?.image || assets.user_robot} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover bg-gray-700 cursor-pointer" 
                            />
                            <div>
                                <h3 
                                onClick={()=> navigate(`/@${post.userId?.username}`)}
                                className="font-bold capitalize">{post.userId?.name || "Utilisateur"}</h3>
                                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>

                        {/* Contenu texte */}
                        <p className="text-gray-200 mb-3 whitespace-pre-wrap">{post.content}</p>

                        {/* Contenu Média (Images) */}
                        {post.media && post.media.length > 0 && (
                            <div className={`grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {post.media.map((item, index) => (
                                    <img 
                                        key={index}
                                        src={`${backendUrl}/${item}`} // Assurez-vous que le backend sert les fichiers statiques
                                        alt="Post content" 
                                        className="w-full max-h-120 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Footer du post (Likes, Commentaires - Optionnel) */}
                        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-700 text-gray-400">
                             <button className="hover:text-indigo-400 flex items-center gap-1">
                                <i className="fi fi-rr-heart"></i> J'aime
                             </button>
                             <button className="hover:text-indigo-400 flex items-center gap-1">
                                <i className="fi fi-rr-comment-alt"></i> Commenter
                             </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* --- BOUTON CREATE FLOTTANT (Mobile) --- */}
        {/* md:hidden = Visible seulement sur mobile */}
        <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            
            {/* Menu qui s'ouvre */}
            {showMobileMenu && (
                <div className="flex flex-col items-end gap-2 mb-1 transition-all animate-bounce-in">
                    {/* Article (Pro seulement) */}
                    {userData && userData.profileType === 'professional' && (
                        <button 
                            onClick={() => {setShowMobileMenu(false)}}
                            className="backdrop-blur-xl bg-white/10 px-2 py-2 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                            Article <i class="fi fi-tr-document-signed flex ml-1"></i>
                        </button>
                    )}
                    
                    {/* Storie */}
                    <button 
                        onClick={() => setShowMobileMenu(false)}
                        className="backdrop-blur-xl bg-white/10 px-2 py-2 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        Storie <i class="fi fi-tr-camera flex ml-1"></i>
                    </button>

                    {/* Post */}
                    <button 
                        onClick={() => {
                            setShowMobileMenu(false);
                            setIsPostModalOpen(true);
                        }}
                        className="backdrop-blur-xl bg-white/10 px-2 py-2 rounded-lg shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                        Post <i class="fi fi-tr-photo-video flex ml-1"></i>
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