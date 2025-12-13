import multer from "multer";
import path from "path";

// 1. D'abord, on configure le stockage (Où mettre les fichiers et comment les nommer)
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    // On génère un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // On force l'extension en minuscule pour éviter les problèmes
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// 2. Ensuite, on définit les filtres (C'est ici qu'on met votre logique de sécurité)

// FILTRE A : Pour Profil et Bannière
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'image/webp',
        'image/gif' // J'ai rajouté ceci pour que vos GIFs de profil continuent de fonctionner
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non supporté. Seules les images (JPEG, PNG, WEBP, GIF) sont autorisées.'), false);
    }
};

// FILTRE B : Pour les Posts (Images + Vidéos)
const mediaFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/webp', // Images
        'image/gif',                                          // GIFs
        'video/mp4', 'video/webm', 'video/quicktime'          // Vidéos
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non supporté. Seuls les images et vidéos sont acceptés.'), false);
    }
};

// 3. Enfin, on crée et on exporte les uploaders

// Pour les profils/bannières (Limité à 5MB)
export const uploadImage = multer({ 
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// Pour les posts (Limité à 100MB pour les vidéos)
export const uploadMedia = multer({ 
    storage: storage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } 
});