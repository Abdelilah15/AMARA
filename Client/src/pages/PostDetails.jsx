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
        <div className="max-w-[650px] mx-auto mt-16">

            {/* Affiche le post. La prop "isDetail" permet de désactiver le clic redirigeant sur lui-même */}
            <PostItem post={post} isDetail={true} />
        </div>
    );
};

export default PostDetails;