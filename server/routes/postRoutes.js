import express from 'express';
import { createPost, getUserPosts, getAllPosts, deletePost, getLinkMetadata } from '../controllers/postController.js';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js'; // Assurez-vous que ce fichier existe

const postRouter = express.Router();

// 'files' est le nom du champ dans le FormData côté client
postRouter.post('/create', userAuth, upload.array('files', 5), createPost);
postRouter.post('/preview-link', userAuth, getLinkMetadata);
postRouter.get('/user/:userId', getUserPosts);
postRouter.get('/all', getAllPosts);
postRouter.delete('/delete/:id', userAuth, deletePost);

export default postRouter;