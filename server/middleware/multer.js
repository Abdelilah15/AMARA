import multer from "multer";
import path from "path";

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/'); // Dossier de destination
  },
  filename: function (req, file, callback) {
    // Nom unique : date + nom d'origine
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export default upload;