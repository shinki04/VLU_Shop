import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({success: false, message: "Forbidden: Admins only" });
  }
  next();
};

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token === null || token === undefined) {
    return res.status(401).json({success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded === null || decoded === undefined) {
      return res.status(401).json({success: false, message: "Unauthorized: Invalid token" });
    }
    req.user = await User.findById(decoded.userId).select("-password");

    if (req.user === null || req.user === undefined) {
      return res.status(404).json({success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({success: false, message: "Internal Server Error" });
  }
};

export { isAdmin, authMiddleware };
