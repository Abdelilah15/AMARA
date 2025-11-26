import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, uploadProfileImage, uploadBannerImage, updateProfileType, updateUserBio, updateUserProfile } from '../controllers/userController.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();
userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-profile-type', userAuth, updateProfileType);
userRouter.post('/update-bio', userAuth, updateUserBio);
userRouter.post('/update-profile', userAuth, updateUserProfile);
userRouter.post('/upload-avatar', userAuth, upload.single('image'), uploadProfileImage);
userRouter.post('/upload-banner', userAuth, upload.single('banner'), uploadBannerImage);


export default userRouter;