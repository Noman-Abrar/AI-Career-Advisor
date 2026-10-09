const adminMiddleware = (req, res, next) => {
  const isAdmin =
    req.user && (req.user.role === "admin" || req.user.isSuperAdmin === true);

  if (!isAdmin) {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

module.exports = adminMiddleware;
