import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, uploadProfileImage, uploadBannerImage, updateProfileType, updateUserBio, updateUserProfile, getAllUsers, getUserProfile, changePassword, sendEmailChangeOtp, verifyEmailChange, savePost, createCollection, getSavedPosts, renameCollection, deleteCollection, togglePinCollection, updateCollectionColor} from '../controllers/userController.js';
import { uploadImage } from '../middleware/multer.js';



const userRouter = express.Router();
userRouter.get('/data', userAuth, getUserData);
userRouter.get('/list', getAllUsers);
userRouter.post('/update-profile-type', userAuth, updateProfileType);
userRouter.post('/update-bio', userAuth, updateUserBio);
userRouter.post('/update-profile', userAuth, updateUserProfile);
userRouter.post('/upload-avatar', userAuth, uploadImage.single('image'), uploadProfileImage);
userRouter.post('/upload-banner', userAuth, uploadImage.single('banner'), uploadBannerImage);
userRouter.post('/change-password', userAuth, changePassword);
userRouter.post('/send-email-otp', userAuth, sendEmailChangeOtp);
userRouter.post('/verify-new-email', userAuth, verifyEmailChange);
userRouter.post('/save-post', userAuth, savePost);
userRouter.post('/create-collection', userAuth, createCollection);
userRouter.get('/saved-posts', userAuth, getSavedPosts);
userRouter.post('/collection/rename', userAuth, renameCollection);
userRouter.post('/collection/delete', userAuth, deleteCollection);
userRouter.post('/collection/toggle-pin', userAuth, togglePinCollection);
userRouter.post('/collection/color', userAuth, updateCollectionColor);
userRouter.get('/:username', getUserProfile);




export default userRouter;