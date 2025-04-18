import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshsecretkey', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

export const refreshToken = async (req, res) => {
  try {
    const token = 
      req.cookies.refreshToken || 
      (req.body && req.body.refreshToken) || 
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null);
    
    if (!token) {
      console.log("No refresh token found");
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

    try {
      const decoded = jwt.verify(token, refreshSecret);
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log("User not found for token");
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const accessToken = generateAccessToken(user._id);

      res.status(200).json({
        success: true,
        accessToken
      });
    } catch (verifyError) {
      console.log("Token verification error:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_REFRESH_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    res
      .status(200)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({
        success: true,
        accessToken,
        refreshToken
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const logout = (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};
