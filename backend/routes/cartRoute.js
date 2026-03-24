import express from 'express';
import { 
  addToCart,
  updateCart,
  removeFromCart,
  getUserCart,
  clearCart,
  syncCart
} from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/get', authUser, getUserCart);
cartRouter.post('/add', authUser, addToCart);
cartRouter.post('/update', authUser, updateCart);
cartRouter.post('/remove', authUser, removeFromCart);
cartRouter.post('/clear', authUser, clearCart);
cartRouter.post('/sync', authUser, syncCart);

export default cartRouter;