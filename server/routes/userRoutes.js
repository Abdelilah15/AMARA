import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, uploadProfileImage, uploadBannerImage} from '../controllers/userController.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();
userRouter.get('/data', userAuth, getUserData);

userRouter.post('/upload-avatar', userAuth, upload.single('image'), uploadProfileImage);
userRouter.post('/upload-banner', userAuth, upload.single('banner'), uploadBannerImage);

export default userRouter;