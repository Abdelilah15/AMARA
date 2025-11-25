import userModel from "../models/userModel.js";

export const getUserData = async (req, res)=>{
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user){
            return res.json({success: false, message: 'User not found'});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                email: user.email,
                image: user.image,
                banner: user.banner
            }
        });
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const uploadProfileImage = async (req, res)=>{
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Aucun fichier n'a été téléchargé." });
        }

        const userId = req.user.id;
        const imagePath = req.file.path;
        const baseUrl = `${req.protocol}://${req.get('host')}/`;
        const fullImageUrl = baseUrl + imagePath.replace(/\\/g, '/');

        await userModel.findByIdAndUpdate(userId, { image: fullImageUrl });
        res.json({ success: true, message: "Image de profil mise à jour", image: fullImageUrl });

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const uploadBannerImage = async (req, res)=>{
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Aucun fichier n'a été téléchargé." });
        }

        const userId = req.user.id;
        const imagePath = req.file.path;
        const baseUrl = `${req.protocol}://${req.get('host')}/`;
        const fullImageUrl = baseUrl + imagePath.replace(/\\/g, '/');

        await userModel.findByIdAndUpdate(userId, { banner: fullImageUrl });
        res.json({ success: true, message: "Image de bannière mise à jour", banner: fullImageUrl });

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}