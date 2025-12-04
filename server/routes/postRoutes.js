import express from 'express';
import { createPost } from '../controllers/postController.js';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js'; // Assurez-vous que ce fichier existe

const postRouter = express.Router();

// 'files' est le nom du champ dans le FormData côté client
postRouter.post('/create', userAuth, upload.array('files', 5), createPost); 

export default postRouter;