import express from 'express';
import { 
  placeOrderStripe,
  allOrders, 
  userOrders, 
  updateStatus,
  verifyStripe,
  getOrderDetails
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.get('/admin/all', adminAuth, allOrders);
orderRouter.get('/admin/:orderId', adminAuth, getOrderDetails);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/place-stripe', authUser, placeOrderStripe);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/user-orders', authUser, userOrders);
orderRouter.get('/user/:orderId', authUser, getOrderDetails);
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.post('/verify-stripe', authUser, verifyStripe);

export default orderRouter;