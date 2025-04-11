import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    
    if (!decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as an admin'
      });
    }
    
    req.admin = await Admin.findById(decoded.adminId);
    
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};