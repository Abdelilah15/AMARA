import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, maxLength: 800 },
    likes: { 
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'user', 
        default: [] 
    },
    media: {
        type: [String], // Un tableau d'URLs
        default: []
    }, // URLs des fichiers uploadés
    linkPreview: {
        url: String,
        title: String,
        description: String,
        image: String,
        domain: String
    },
    createdAt: { type: Date, default: Date.now }
});

const postModel = mongoose.models.post || mongoose.model("post", postSchema);

export default postModel;