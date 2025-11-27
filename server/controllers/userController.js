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
                banner: user.banner,
                bio: user.bio,
                profileType: user.profileType,
                links: user.links || []
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

export const updateUserBio = async (req, res) => {
    try {
        const { bio } = req.body;
        const userId = req.user.id;

        await userModel.findByIdAndUpdate(userId, { bio });
        res.json({ success: true, message: "Bio mise à jour avec succès" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateProfileType = async (req, res) => {
    try {
        const { profileType } = req.body;
        const userId = req.user.id;

        if (!['personal', 'professional'].includes(profileType)) {
            return res.json({ success: false, message: "Type de profil invalide" });
        }

        await userModel.findByIdAndUpdate(userId, { profileType });
        res.json({ success: true, message: "Type de profil mis à jour" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, links } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio; // Permet de vider la bio si besoin
        if (links) updateData.links = links;

        await userModel.findByIdAndUpdate(userId, updateData);
        
        res.json({ success: true, message: "Profil mis à jour avec succès" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}