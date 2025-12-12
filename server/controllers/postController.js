import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import axios from 'axios';
import * as cheerio from 'cheerio';

// --- 1. Nouvelle fonction pour récupérer les métadonnées d'un lien ---
export const getLinkMetadata = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.json({ success: false, message: "URL manquante" });

        // On récupère le HTML de la page
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AmaraBot/1.0)' },
            timeout: 10000 // Timeout de 5s pour ne pas bloquer
        });

        const $ = cheerio.load(data);

        // Extraction des balises Open Graph ou fallback sur les balises standard
        const metadata = {
            url: url,
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
            image: $('meta[property="og:image"]').attr('content') || '',
            domain: new URL(url).hostname
        };

        return res.json({ success: true, metadata });

    } catch (error) {
        console.error("Erreur link preview:", error.message);
        // On ne renvoie pas d'erreur 500 pour ne pas casser l'UI, juste un succès false
        return res.json({ success: false, message: "Impossible de récupérer l'aperçu" });
    }
};

export const createPost = async (req, res) => {
    try {
        const { content, linkPreview } = req.body;
        const userId = req.user.id;
        
        // Récupérer les chemins des fichiers uploadés via Multer
        const media = req.files ? req.files.map(file => `uploads/${file.filename}`) : [];

        // Parse linkPreview s'il arrive sous forme de string (via FormData)
        let parsedLinkPreview = null;
        if (linkPreview) {
            try {
                parsedLinkPreview = JSON.parse(linkPreview);
            } catch (e) {
                parsedLinkPreview = null;
            }
        }

        if (!content && media.length === 0 && !parsedLinkPreview) {
            return res.json({ success: false, message: "Le post ne peut pas être vide." });
        }

        const newPost = new postModel({
            userId,
            content,
            media,
            linkPreview: parsedLinkPreview
        });

        await newPost.save();

        res.json({ success: true, message: "Post publié avec succès", post: newPost });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const formatPostForFrontend = (postDocument) => {
    // On convertit le document Mongoose en objet JavaScript simple si ce n'est pas déjà fait
    const post = postDocument.toObject ? postDocument.toObject() : postDocument;

    let mediaUrl = null;
    let mediaType = null;

    // Si le tableau media contient quelque chose
    if (post.media && post.media.length > 0) {
        // 1. On prend le premier fichier du tableau pour 'mediaUrl'
        // Si vous stockez juste "uploads/file.jpg", le frontend aura besoin de l'URL complète
        // Assurez-vous que votre frontend gère l'URL de base, sinon ajoutez-la ici :
        // mediaUrl = process.env.BACKEND_URL + '/' + post.media[0]; 
        mediaUrl = post.media[0]; 

        // 2. On détermine le 'mediaType' selon l'extension
        const extension = mediaUrl.split('.').pop().toLowerCase();
        if (['mp4', 'mov', 'webm', 'ogg'].includes(extension)) {
            mediaType = 'video';
        } else {
            mediaType = 'image';
        }
    }

    // On retourne le post avec les nouvelles propriétés ajoutées
    return {
        ...post,
        mediaUrl: mediaUrl,
        mediaType: mediaType
    };
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Vérification de sécurité : est-ce un ID valide ?
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: false, message: "ID utilisateur invalide" });
        }

        // 2. Conversion explicite en ObjectId pour garantir la correspondance
        const objectId = new mongoose.Types.ObjectId(userId);

        // 3. Recherche avec l'ObjectId
        const posts = await postModel.find({ userId: objectId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name username image');

        const formattedPosts = posts.map(post => formatPostForFrontend(post));

        res.json({ success: true, posts: formattedPosts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        // On récupère tous les posts, triés par date, et on inclut les infos de l'auteur (populate)
        const posts = await postModel.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name image username'); // Important pour afficher le nom/image de l'auteur

        const formattedPosts = posts.map(post => formatPostForFrontend(post));

        res.json({ success: true, posts: formattedPosts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Récupéré via le middleware userAuth

        // 1. Trouver le post
        const post = await postModel.findById(id);

        if (!post) {
            return res.json({ success: false, message: "Post introuvable" });
        }

        // 2. Vérifier que l'utilisateur est bien le créateur du post
        if (post.userId.toString() !== userId) {
            return res.json({ success: false, message: "Action non autorisée" });
        }

        // 3. (Optionnel) Supprimer les fichiers images associés du dossier 'uploads'
        // Si vous voulez nettoyer le serveur, vous pouvez utiliser fs.unlink ici.

        // 4. Supprimer le post de la base de données
        await postModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Post supprimé avec succès" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}