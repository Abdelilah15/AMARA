import bcrypt from 'bcryptjs';
import userModel from "../models/userModel.js";
import transporter from '../config/nodemailer.js';
import { EMAIL_CHANGE_TEMPLATE } from '../config/emailTemplates.js';
import postModel from '../models/postModel.js';


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
                _id: user._id,
                name: user.name,
                username: user.username,
                isAccountVerified: user.isAccountVerified,
                email: user.email,
                image: user.image,
                banner: user.banner,
                bio: user.bio,
                profileType: user.profileType,
                links: user.links || [],
                createdAt: user.createdAt,
                savedCollections: user.savedCollections || []
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

export const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.json({ success: false, message: "Données manquantes" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "Utilisateur non trouvé" });
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "L'ancien mot de passe est incorrect" });
        }

        // Validation du nouveau mot de passe (optionnel mais recommandé)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.json({ 
                success: false, 
                message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.' 
            });
        }

        // Hasher et sauvegarder le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 8); // 8 tours comme dans votre authController
        user.password = hashedPassword;
        await user.save();

        return res.json({ success: true, message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendEmailChangeOtp = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.user.id;

        if (!newEmail) return res.json({ success: false, message: "Email requis" });

        // Vérifier si l'email est déjà utilisé par quelqu'un d'autre
        const existingUser = await userModel.findOne({ email: newEmail });
        if (existingUser) {
            return res.json({ success: false, message: "Cet email est déjà utilisé." });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        // On sauvegarde l'OTP et le nouvel email demandé temporairement dans l'utilisateur
        // Assurez-vous que votre modèle User accepte des champs flexibles ou ajoutez-les au Schema si strict
        await userModel.findByIdAndUpdate(userId, {
            emailChangeOtp: otp,
            newEmailRequest: newEmail,
            emailChangeOtpExpireAt: Date.now() + 15 * 60 * 1000 // 15 min expiration
        });

        // Envoyer l'email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: newEmail,
            subject: 'Vérification de votre nouvel email',
            //text: `Votre code de vérification pour changer d'email est : ${otp}. Ce code expire dans 15 minutes.`
            html: EMAIL_CHANGE_TEMPLATE.replace('{{otp}}', otp)
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Code de vérification envoyé au nouvel email" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const verifyEmailChange = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;

        const user = await userModel.findById(userId);

        if (!user || !user.newEmailRequest || !user.emailChangeOtp) {
            return res.json({ success: false, message: "Aucune demande de changement d'email en cours" });
        }

        if (user.emailChangeOtp !== otp) {
            return res.json({ success: false, message: "Code OTP invalide" });
        }

        if (user.emailChangeOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "Le code a expiré" });
        }

        // Appliquer le changement
        user.email = user.newEmailRequest;
        
        // Nettoyer les champs temporaires
        user.newEmailRequest = undefined;
        user.emailChangeOtp = undefined;
        user.emailChangeOtpExpireAt = undefined;
        
        // Important : Si vous voulez que le nouvel email soit considéré comme vérifié :
        // user.isAccountVerified = true; 
        // Sinon, remettez le à false pour forcer une nouvelle vérification globale.

        await user.save();

        res.json({ success: true, message: "Email mis à jour avec succès !" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleFollow = async (req, res) => {
    try {
        const { targetUserId } = req.body; // L'ID de la personne qu'on veut suivre
        const userId = req.user.id; // Mon ID (celui qui clique)

        if (userId === targetUserId) {
            return res.json({ success: false, message: "Vous ne pouvez pas vous suivre vous-même." });
        }

        const user = await userModel.findById(userId);
        const targetUser = await userModel.findById(targetUserId);

        if (!user || !targetUser) {
            return res.json({ success: false, message: "Utilisateur introuvable" });
        }

        // Vérifier si on suit déjà cette personne
        const isFollowing = user.following.includes(targetUserId);

        if (isFollowing) {
            // UNFOLLOW : Retirer des deux listes
            user.following = user.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
            
            await user.save();
            await targetUser.save();
            
            return res.json({ success: true, message: "Unfollowed", action: 'unfollowed' });
        } else {
            // FOLLOW : Ajouter aux deux listes
            user.following.push(targetUserId);
            targetUser.followers.push(userId);

            await user.save();
            await targetUser.save();

            return res.json({ success: true, message: "Followed", action: 'followed' });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const savePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId, collectionName } = req.body;

        const user = await userModel.findById(userId);
        const post = await postModel.findById(postId);

        if (!post) return res.json({ success: false, message: "Post introuvable" });

        // Vérifier si le post est déjà sauvegardé
        const isAlreadySaved = user.savedPosts.some(item => item.post.toString() === postId);

        if (isAlreadySaved) {
            // Si déjà sauvegardé, on le retire (Unsave) - Ou on pourrait mettre à jour le dossier
            // Ici, pour simplifier : si on rappelle save, on met à jour la collection, ou on supprime si demandé explicitement
            // Mais pour une logique "Toggle" simple :
            
            // Retirer de la liste de l'utilisateur
            user.savedPosts = user.savedPosts.filter(item => item.post.toString() !== postId);
            
            // Retirer l'ID utilisateur du tableau 'saves' du Post (pour le compteur)
            if (post.saves && post.saves.includes(userId)) { 
                post.saves = post.saves.filter(id => id.toString() !== userId);
                await post.save();
            }
            
            await user.save();
            return res.json({ success: true, message: "Post retiré des sauvegardes", action: 'unsaved' });
        } else {
            // Ajouter à la liste de l'utilisateur
            user.savedPosts.push({ post: postId, collectionName: collectionName });
            
            // Ajouter l'ID utilisateur au tableau 'saves' du Post
            if (!post.saves) post.saves = []; 
            if (!post.saves.includes(userId)) {
                post.saves.push(userId);
                await post.save();
            }

            if (!user.savedCollections) user.savedCollections = [];

            // On vérifie correctement si une collection avec ce nom existe déjà
            if (collectionName) {
                const collectionExists = user.savedCollections.some(col => col.name === collectionName);
                
                // Si elle n'existe pas, on l'ajoute comme un OBJET et non comme une string
                if (!collectionExists) {
                    user.savedCollections.push({ name: collectionName });
                }
            }

            await user.save();
            return res.json({ success: true, message: "Post enregistré", action: 'saved' });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const createCollection = async (req, res) => {
    try {
        const userId = req.user.id;
        const { collectionName } = req.body;

        if(!collectionName) return res.json({ success: false, message: "Nom requis" });

        const user = await userModel.findById(userId);
        
        const exists = user.savedCollections.some(c => c.name === collectionName);
        if (exists) {
            return res.json({ success: false, message: "Ce groupe existe déjà" });
        }

        user.savedCollections.push({
            name: collectionName,
            color: 'bg-gray-200',
            pinned: false
        });

        await user.save();

        res.json({ success: true, message: "Groupe créé", collections: user.savedCollections });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { collectionName } = req.query;

        console.log(`Fetching saved posts for user: ${userId}`);

        const user = await userModel.findById(userId).populate({
            path: 'savedPosts.post',
            populate: { path: 'userId', select: 'name username image' }
        });

        if (!user) return res.json({ success: false, message: "Utilisateur non trouvé" });

        console.log(`Raw savedPosts count: ${user.savedPosts.length}`);

        // 1. Filtrer et trier
        let savedItems = user.savedPosts
            .filter(item => item.post !== null)
            .reverse();

        if (collectionName && collectionName !== 'Tous') {
            savedItems = savedItems.filter(item => item.collectionName === collectionName);
        }

        console.log(`Items after filtering: ${savedItems.length}`);

        // 2. FORMATAGE EN GARDANT LA STRUCTURE { post: ..., collectionName: ... }
        const formattedSavedPosts = savedItems.map(item => {

            if (!item.post || !item.post._id) return null;
            // On convertit le post en objet modifiable
            const postObj = item.post.toObject ? item.post.toObject() : item.post;

            let mediaUrl = null;
            let mediaType = null;

            // Logique de détection média
            if (postObj.media && postObj.media.length > 0) {
                mediaUrl = postObj.media[0];
                const extension = mediaUrl.split('.').pop().toLowerCase();
                mediaType = ['mp4', 'mov', 'webm', 'ogg'].includes(extension) ? 'video' : 'image';
            }

            // On injecte les infos DANS l'objet post
            postObj.mediaUrl = mediaUrl;
            postObj.mediaType = mediaType;

            // On retourne l'objet wrapper complet (item) avec le post mis à jour
            return {
                ...item.toObject(), // Garde collectionName, _id du wrapper, etc.
                post: postObj       // Remplace le post brut par le post formaté
            };
        }).filter(item => item !== null);


        let collections = user.savedCollections.map(col => {
            if (typeof col === 'string') {
                return { name: col, color: 'bg-gray-200', pinned: false, _id: col }; 
            }
            return col;
        });

        res.json({ 
            success: true, 
            savedPosts: formattedSavedPosts,
            collections: collections 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const renameCollection = async (req, res) => {
    try {
        const { collectionId, newName } = req.body;
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        const collection = user.savedCollections.id(collectionId);
        if(!collection) return res.json({success: false, message: "Collection introuvable"});

        // Mettre à jour le nom dans la liste des collections
        const oldName = collection.name;
        collection.name = newName;

        // Mettre à jour le nom dans tous les posts sauvegardés associés
        user.savedPosts.forEach(post => {
            if (post.collectionName === oldName) {
                post.collectionName = newName;
            }
        });

        await user.save();
        res.json({ success: true, message: "Renommé avec succès" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteCollection = async (req, res) => {
    try {
        const { collectionId } = req.body;
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        const collection = user.savedCollections.id(collectionId);
        if(!collection) return res.json({success: false, message: "Collection introuvable"});
        
        // Supprimer la collection
        user.savedCollections.pull(collectionId);

        // Déplacer les posts vers "Général" (ou les supprimer si vous préférez)
        // Ici je les déplace vers Général pour ne pas perdre les favoris
        user.savedPosts.forEach(post => {
            if (post.collectionName === collection.name) {
            }
        });

        await user.save();
        res.json({ success: true, message: "Collection supprimée" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const togglePinCollection = async (req, res) => {
    try {
        const { collectionId } = req.body;
        const user = await userModel.findById(req.user.id);
        const collection = user.savedCollections.id(collectionId);
        
        if(collection) {
            collection.pinned = !collection.pinned;
            await user.save();
            res.json({ success: true, message: collection.pinned ? "Épinglée" : "Désépinglée" });
        } else {
            res.json({ success: false, message: "Collection introuvable" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateCollectionColor = async (req, res) => {
    try {
        const { collectionId, color } = req.body;
        const user = await userModel.findById(req.user.id);
        const collection = user.savedCollections.id(collectionId);
        
        if(collection) {
            collection.color = color;
            await user.save();
            res.json({ success: true, message: "Couleur mise à jour" });
        } else {
            res.json({ success: false, message: "Collection introuvable" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

