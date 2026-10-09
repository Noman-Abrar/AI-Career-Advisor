const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Access denied. Invalid authorization header.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    // Role token se nahi, database se (taaki demote/delete turant lage)
    const user = await User.findById(decoded.userId)
      .select("role isSuperAdmin")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "Account no longer exists.",
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      isSuperAdmin: user.isSuperAdmin === true,
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);

    return res.status(500).json({
      message: "Authentication failed. Please try again.",
    });
  }
};

module.exports = authMiddleware;
