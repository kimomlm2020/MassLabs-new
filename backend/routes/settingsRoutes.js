import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getSettings,
  updateSettings,
  testEmail,
  testStripe,
  uploadImage
} from '../controllers/settingsController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Public route - get basic settings (no auth required)
router.get('/settings', getSettings);

// Protected admin routes (using your real adminAuth)
router.get('/admin/settings', adminAuth, getSettings);
router.post('/admin/settings', adminAuth, updateSettings);
router.post('/admin/test-email', adminAuth, testEmail);
router.post('/admin/test-stripe', adminAuth, testStripe);
router.post('/admin/upload', adminAuth, upload.single('image'), uploadImage);

export default router;