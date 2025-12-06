import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";

// Créer un post
export const createPost = async (req, res) => {
    try {
        const { userId, content } = req.body;
        
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

        // On cherche les posts avec cet userId, triés du plus récent au plus ancien
        const posts = await postModel.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}