const superAdminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({
      message: "Access denied. Super Admin privileges are required.",
    });
  }

  next();
};

module.exports = superAdminMiddleware;
