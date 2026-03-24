import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token. Login again.' });
  }
};

export default authUser;