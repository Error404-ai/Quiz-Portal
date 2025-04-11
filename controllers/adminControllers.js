import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_REFRESH_SECRET || "refreshsecretkey",
      { expiresIn: "7d" }
    );

    const cookieOptions = {
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    res
      .status(200)
      .cookie('adminRefreshToken', refreshToken, cookieOptions)
      .json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken
      });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};