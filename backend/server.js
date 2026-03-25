import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import settingsRouter from './routes/settingsRoutes.js';
import subscriberRouter from './routes/subscriberRoute.js'; 
import emailRoutes from './routes/emailRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

connectDB().then(() => {
  console.log('DB Connected');
}).catch(err => {
  console.error('DB Connection Error:', err);
});

connectCloudinary();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/subscribers', subscriberRouter); 
app.use('/api/email', emailRoutes);


app.get('/', (req, res) => {
  res.json({ success: true, message: "Mass Labs API", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});