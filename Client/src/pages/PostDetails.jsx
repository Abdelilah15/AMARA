import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import PostItem from '../components/PostItem';
import { toast } from 'react-toastify';

const PostDetails = () => {
    const { id } = useParams(); // Récupère l'ID depuis l'URL
    const { backendUrl } = useContext(AppContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPost = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/post/single/' + id);
            if (data.success) {
                setPost(data.post);
            } else {
                toast.error("Post introuvable");
                navigate('/'); // Redirige si le post n'existe pas
            }
        } catch (error) {
            toast.error("Erreur de chargement");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
        // eslint-disable-next-line
    }, [id]);

    if (loading) return <div className="text-white text-center mt-10">Chargement...</div>;
    if (!post) return null;

    return (
        <div className="max-w-2xl mx-auto pt-4 px-2">
            
            {/* Bouton retour simple */}
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
                <i className="fi fi-rr-arrow-left"></i> Retour
            </button>

            {/* Affiche le post. La prop "isDetail" permet de désactiver le clic redirigeant sur lui-même */}
            <PostItem post={post} isDetail={true} />

            {/* Section Commentaires (Structure de base pour le moment) */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 text-white">
                <h3 className="font-bold mb-4">Commentaires</h3>
                
                {/* Champ de saisie */}
                <div className="flex gap-3 mb-6">
                     <img src={post.userId?.image} className="w-8 h-8 rounded-full bg-gray-600"/>
                     <div className="flex-1">
                        <textarea 
                            className="w-full bg-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            placeholder="Poster une réponse..."
                            rows="2"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            <button className="bg-blue-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-500">Répondre</button>
                        </div>
                     </div>
                </div>

                {/* Liste vide pour l'instant */}
                <p className="text-gray-500 text-center text-sm">Aucun commentaire pour l'instant.</p>
            </div>
        </div>
    );
};

export default PostDetails;