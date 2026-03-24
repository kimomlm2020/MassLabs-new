import express from 'express';
import { 
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  adminUpdateUser,
  changePassword,
  getUserOrders,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  listUsers,
  getUserById,
  updateUserStatus,
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  deleteUser,

} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadSingle } from '../middleware/multer.js';

const userRouter = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// ============================================
// USER ROUTES (authUser)
// ============================================
userRouter.get('/profile', authUser, getUserProfile);
userRouter.post('/update-profile', authUser, updateUserProfile);
userRouter.post('/change-password', authUser, changePassword);
userRouter.post('/upload-avatar', authUser, uploadSingle('avatar'), uploadAvatar);
userRouter.get('/orders', authUser, getUserOrders);

// ============================================
// ADMIN ROUTES (adminAuth)
// ============================================
userRouter.get('/admin/stats', adminAuth, getAdminStats);
userRouter.get('/admin/users', adminAuth, listUsers);
userRouter.get('/admin/user/:userId', adminAuth, getUserById);
userRouter.delete('/admin/user/:userId', adminAuth, deleteUser);
userRouter.get('/admin/orders', adminAuth, getAllOrders);
userRouter.put('/admin/order-status', adminAuth, updateOrderStatus);
userRouter.post('/admin/update-user', adminAuth, adminUpdateUser);

// ============================================
// LEGACY ROUTES (to match frontend POST calls)
// ============================================
userRouter.get('/list', adminAuth, listUsers);
userRouter.post('/list', adminAuth, listUsers);        // Added for frontend
userRouter.post('/delete', adminAuth, deleteUser);     // Added for frontend
userRouter.post('/status', adminAuth, updateUserStatus); // Added for frontend
userRouter.get('/admin/orders', adminAuth, getAllOrders);
userRouter.get('/:userId', adminAuth, getUserById);

export default userRouter;