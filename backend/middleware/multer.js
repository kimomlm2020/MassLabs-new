// middleware/multer.js - Version complète avec corrections
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer les dossiers nécessaires de façon robuste
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/avatars'),
    path.join(__dirname, '../uploads/products')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Configuration pour les avatars (avec ID utilisateur)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarPath = path.join(__dirname, '../uploads/avatars');
    cb(null, avatarPath);
  },
  filename: (req, file, cb) => {
    // Utiliser l'ID utilisateur pour un nom unique et traçable
    const userId = req.userId || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Format: avatar-userId-timestamp-random.ext
    const filename = `avatar-${userId}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Configuration pour les produits
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productPath = path.join(__dirname, '../uploads/products');
    cb(null, productPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `product-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtre plus strict pour les images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez JPG, PNG, WebP ou GIF'), false);
  }
};

// Middleware pour upload d'avatar
export const uploadAvatar = (req, res, next) => {
  const upload = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    }
  }).single('avatar'); // Le champ doit s'appeler 'avatar'

  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Fichier trop volumineux. Maximum 5MB.' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          success: false, 
          message: 'Un seul fichier est autorisé.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
};

// Middleware générique pour un seul fichier (pour compatibilité)
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const upload = multer({
      storage: avatarStorage, // Par défaut avatarStorage
      fileFilter: imageFilter,
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
      }
    }).single(fieldName);

    upload(req, res, function(err) {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      next();
    });
  };
};

// Middleware pour plusieurs fichiers (produits)
export const uploadMultiple = (fieldName, maxCount = 4) => {
  return (req, res, next) => {
    const upload = multer({
      storage: productStorage,
      fileFilter: imageFilter,
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: maxCount
      }
    }).array(fieldName, maxCount);

    upload(req, res, function(err) {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      next();
    });
  };
};

// Export par défaut pour rétrocompatibilité
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

export default upload;