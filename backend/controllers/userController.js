import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const createToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Helper for timing-safe comparison
const safeCompare = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id, user.role);
    
    res.json({ 
      success: true, 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || {},
        cartData: user.cartData || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const exists = await userModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must contain uppercase, lowercase, number and special character" 
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      cartData: {}
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(201).json({ 
      success: true, 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cartData: {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password: '***' });
    console.log('Expected:', { 
      email: process.env.ADMIN_EMAIL, 
      passwordSet: !!process.env.ADMIN_PASSWORD 
    });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      });
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    const emailMatch = email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatch = password === process.env.ADMIN_PASSWORD;

    console.log('Match results:', { emailMatch, passwordMatch });

    if (emailMatch && passwordMatch) {
      const token = jwt.sign(
        { 
          email: process.env.ADMIN_EMAIL, 
          role: 'admin', 
          id: 'admin_' + Date.now() 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        success: true, 
        token, 
        role: 'admin',
        email: process.env.ADMIN_EMAIL
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid admin credentials" 
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || {},
        avatar: user.avatar, 
        cartData: user.cartData || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = String(name).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (address && typeof address === 'object') {
      updateData.address = {
        firstName: address.firstName ? String(address.firstName).trim() : '',
        lastName: address.lastName ? String(address.lastName).trim() : '',
        email: address.email ? String(address.email).trim() : '',
        phone: address.phone ? String(address.phone).trim() : '',
        street: address.street ? String(address.street).trim() : '',
        apartment: address.apartment ? String(address.apartment).trim() : '',
        city: address.city ? String(address.city).trim() : '',
        state: address.state ? String(address.state).trim() : '',
        zipcode: address.zipcode ? String(address.zipcode).trim() : '',
        country: address.country ? String(address.country).trim() : 'FR'
      };
    }

    const user = await userModel.findByIdAndUpdate(
      req.userId, 
      updateData, 
      { returnDocument: 'after', runValidators: true } // FIXED: new: true → returnDocument: 'after'
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email" });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset email has been sent" });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Mass Labs" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ success: true, message: "If an account exists, a reset email has been sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide token and new password" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dans userController.js - Version corrigée
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Construire l'URL complète de l'avatar
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    
    console.log('Uploading avatar for user:', req.userId);
    console.log('Avatar URL:', avatarUrl);

    const user = await userModel.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { returnDocument: 'after', runValidators: true } 
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Retourner une réponse complète et cohérente
    res.json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      },
      avatarUrl: user.avatar // Pour compatibilité
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    
    const orders = await orderModel.find({ userId })
      .sort({ date: -1 })
      .lean();

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        subCategory: item.subCategory,
        sku: item.sku
      })),
      amount: order.amount,
      subtotal: order.subtotal,
      shipping: order.shipping,
      address: order.address,
      status: order.status,
      payment: order.payment,
      paymentDate: order.paymentDate,
      date: order.date || order.createdAt,
      createdAt: order.createdAt
    }));

    res.json({ 
      success: true, 
      count: formattedOrders.length,
      orders: formattedOrders 
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await userModel.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await userModel.countDocuments(query);

    res.json({ 
      success: true, 
      count: users.length,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ADMIN DASHBOARD CONTROLLERS
// ============================================

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    
    // Calculate total revenue
    const orders = await orderModel.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Recent orders (last 7 days)
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await orderModel.find({ date: { $gte: lastWeek } }).countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const orders = await orderModel.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await orderModel.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID and status required' 
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { returnDocument: 'after' } // FIXED: new: true → returnDocument: 'after'
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Order status updated',
      order 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/delete - Delete user from body (avec compatibilité)
export const deleteUser = async (req, res) => {
  try {
    // Gère à la fois DELETE /admin/user/:userId et POST /delete
    const userId = req.params.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Prevent admin from deleting themselves
    if (req.userId === userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const user = await userModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/status - Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and status are required' 
      });
    }

    // Validate status values
    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: active, inactive, or banned' 
      });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { status },
      { returnDocument: 'after' } // FIXED: new: true → returnDocument: 'after'
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      message: `User status updated to ${status}`,
      user 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin update user profile
export const adminUpdateUser = async (req, res) => {
  try {
    const { userId, name, phone, role, status, address } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (address) updateData.address = address;

    const user = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { returnDocument: 'after', runValidators: true } // FIXED: new: true → returnDocument: 'after'
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};