import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import CreatePostModal from '../components/CreatePostModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PostItem from '../components/PostItem';



const Feed = () => {
    const navigate = useNavigate()
    const { userData, backendUrl, globalNewPost, setGlobalNewPost } = useContext(AppContext);

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);


    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState(null);

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

    const removePostFromList = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    const handlePostCreated = (newPost) => {
        // On ajoute le nouveau post au début de la liste existante
        // On s'assure d'inclure les infos de l'utilisateur actuel pour l'affichage immédiat
        const postWithUser = { 
            ...newPost, 
            userId: userData // Important pour afficher l'avatar/nom tout de suite
        };
        
        setPosts((prevPosts) => [postWithUser, ...prevPosts]);
        
        // Optionnel : Vous pouvez aussi relancer fetchPosts() en arrière-plan pour être sûr
        // fetchPosts(); 
    };

    const handleLocalPostCreated = (newPost) => {
        const postWithUser = { ...newPost, userId: userData };
        setPosts((prev) => [postWithUser, ...prev]);
    };

    useEffect(() => {
        if (globalNewPost) {
            // 1. Ajouter le post à la liste locale
            setPosts((prev) => [globalNewPost, ...prev]);
            
            // 2. IMPORTANT : Vider le globalNewPost pour ne pas le rajouter en boucle
            setGlobalNewPost(null);
        }
    }, [globalNewPost, setGlobalNewPost]);

    return (
        <div className='min-h-screen bg-gray-900 text-white pb-10 relative'>
            <Navbar />

            {/* --- ZONE D'AFFICHAGE DES POSTS --- */}
            <div className=" pt-16 max-w-[650px] mx-auto flex flex-col">
                {loading ? (
                    <p className="text-center text-gray-400">Chargement des posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-center text-gray-400">Aucun post pour le moment.</p>
                ) : (
                    // On utilise simplement PostItem ici
                    posts.map((post) => (
                        <PostItem
                            key={post._id}
                            post={post}
                            onDelete={removePostFromList}
                        />
                    ))
                )}
            </div>

            {/* --- BOUTON CREATE FLOTTANT (Mobile) --- */}
            <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">

                {/* Menu qui s'ouvre */}
                {showMobileMenu && (
                    <div className="flex flex-col items-end gap-2 mb-1 transition-all animate-bounce-in">
                        {/* Article (Pro seulement) */}
                        {userData && userData.profileType === 'professional' && (
                            <button
                                onClick={() => { setShowMobileMenu(false) }}
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
                            className="bg-black px-2 py-2 rounded-lg shadow-lg flex items-center justify-center text-[#00ff73ff] text-xl hover:scale-110 transition-transform">
                            Post <i class="fi fi-tr-photo-video flex ml-1"></i>
                        </button>
                    </div>

                )}

                {/* Le Gros Bouton Carré Principal */}
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    style={{ backgroundColor: "#00ff73ff" }}
                    className="w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center text-gray-800 transition-transform active:scale-95"
                >
                    {/* Icône qui change si ouvert/fermé */}
                    <i style={{ fontSize: "30px" }} className={`fi fi-ts-feather transition-transform duration-300 flex ${showMobileMenu ? 'rotate-45 scale-125' : ''}`}></i>
                </button>
            </div>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onPostCreated={handleLocalPostCreated}
            />

        </div>
    )
}

export default Feed