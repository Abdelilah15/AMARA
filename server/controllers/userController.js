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
                username: user.username,
                isAccountVerified: user.isAccountVerified,
                email: user.email,
                image: user.image,
                banner: user.banner,
                bio: user.bio,
                profileType: user.profileType,
                links: user.links || [],
                createdAt: user.createdAt
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
        const { userId, name, username, bio, links, profileType } = req.body;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "Utilisateur non trouvé" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio; // Permet de vider la bio si besoin
        if (links) updateData.links = links;
        if (username && username !== user.username) {
            // Vérifier si le nouveau username est déjà pris par QUELQU'UN D'AUTRE
            const usernameExists = await userModel.findOne({ username });
            if (usernameExists) {
                return res.json({ success: false, message: "Ce nom d'utilisateur est déjà pris." });
            }

            // 2. Vérifier le délai de 15 jours
            if (user.usernameLastChanged) {
                const today = new Date();
                const lastChanged = new Date(user.usernameLastChanged);
                
                // Calcul de la différence en temps
                const timeDiff = today.getTime() - lastChanged.getTime();
                // Convertir en jours (1000ms * 60s * 60min * 24h)
                const daysDiff = timeDiff / (1000 * 3600 * 24);

                if (daysDiff < 15) {
                    const daysLeft = Math.ceil(15 - daysDiff);
                    return res.json({ 
                        success: false, 
                        message: `Vous devez attendre encore ${daysLeft} jour(s) avant de changer à nouveau votre pseudo.` 
                    });
                }
            }

            // 3. Appliquer le changement
            user.username = username;
            user.usernameLastChanged = new Date(); // Mettre à jour la date
        }
        // ---------------------------------------

        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (links) user.links = links;
        if (profileType) user.profileType = profileType;

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour',
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                // ... renvoyez les autres données nécessaires
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
  try {
    // On cherche l'utilisateur par son username (qui est dans l'URL)
    const { username } = req.params;
    
    // On exclut le mot de passe et l'email pour la sécurité
    const user = await userModel.findOne({ username }).select('-password -email');

    if (!user) {
      return res.json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({ success: true, userData: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
    try {
        // On récupère tous les utilisateurs, mais on cache les infos sensibles (mot de passe, etc.)
        const users = await userModel.find({}).select('-password -email -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt');
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};