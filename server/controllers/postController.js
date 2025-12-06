import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

// Créer un post
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;
        
        // Récupérer les chemins des fichiers uploadés via Multer
        const media = req.files ? req.files.map(file => `uploads/${file.filename}`) : [];

        if (!content && media.length === 0) {
            return res.json({ success: false, message: "Le post ne peut pas être vide." });
        }

        const newPost = new postModel({
            userId,
            content,
            media
        });

        await newPost.save();

        res.json({ success: true, message: "Post publié avec succès", post: newPost });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

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

        res.json({ success: true, posts });
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

        res.json({ success: true, posts });
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