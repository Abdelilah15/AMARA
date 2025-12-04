import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, maxLength: 300 },
    media: [{ type: String }], // URLs des fichiers uploadés
    createdAt: { type: Date, default: Date.now }
});

const postModel = mongoose.models.post || mongoose.model("post", postSchema);

export default postModel;