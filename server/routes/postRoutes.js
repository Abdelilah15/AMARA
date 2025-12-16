import express from 'express';
import { createPost, getUserPosts, getAllPosts, deletePost, getLinkMetadata, getPostById, likePost } from '../controllers/postController.js';
import userAuth from '../middleware/userAuth.js';
import { uploadMedia } from '../middleware/multer.js'; // Assurez-vous que ce fichier existe

const postRouter = express.Router();

// 'files' est le nom du champ dans le FormData côté client
postRouter.post('/create', userAuth, uploadMedia.array('files', 5), createPost);
postRouter.post('/preview-link', userAuth, getLinkMetadata);
postRouter.get('/user/:userId', getUserPosts);
postRouter.post('/like', userAuth, likePost);
postRouter.get('/all', getAllPosts);
postRouter.get('/single/:id', getPostById);
postRouter.delete('/delete/:id', userAuth, deletePost);

export default postRouter;