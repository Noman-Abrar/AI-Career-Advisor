const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Analysis = require("../models/Analysis");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

const router = express.Router();

// ==========================================
// REMOVE ANALYSES OF DELETED USERS (ONE TIME)
// ==========================================

let orphanCleanupDone = false;

const removeOrphanAnalyses = async () => {
  if (orphanCleanupDone) return;

  const existingUserIds = await User.distinct("_id");

  await Analysis.deleteMany({
    user: { $nin: existingUserIds },
  });

  orphanCleanupDone = true;
};

// ==========================================
// ID VALIDATION
// ==========================================

const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  next();
};

// ==========================================
// ADMIN STATS
// ==========================================

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await removeOrphanAnalyses();

    const [totalUsers, totalAnalyses, totalAdmins, totalNormalUsers] =
      await Promise.all([
        User.countDocuments(),
        Analysis.countDocuments(),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
      ]);

    res.status(200).json({
      totalUsers,
      totalAnalyses,
      totalAdmins,
      totalNormalUsers,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get admin statistics",
    });
  }
});

// ==========================================
// GET ALL USERS
// ==========================================

router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
});

// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.isSuperAdmin) {
        return res.status(400).json({
          message: "Super Admin account cannot be deleted.",
        });
      }

      if (user._id.toString() === req.user.userId) {
        return res.status(400).json({
          message: "You cannot delete your own admin account.",
        });
      }

      if (user.role === "admin") {
        return res.status(403).json({
          message: "Admin accounts cannot be deleted.",
        });
      }

      await User.findByIdAndDelete(req.params.id);

      await Analysis.deleteMany({ user: req.params.id });

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("DELETE USER ERROR:", error.message);

      res.status(500).json({
        message: "Failed to delete user",
      });
    }
  },
);

// ==========================================
// UPDATE USER ROLE (ONLY SUPER ADMIN)
// ==========================================

router.put(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role. Role must be user or admin.",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.isSuperAdmin) {
        return res.status(400).json({
          message: "Super Admin role cannot be changed.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            role,
            isSuperAdmin: false,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).select("-password");

      res.status(200).json({
        message: "User role updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isSuperAdmin: updatedUser.isSuperAdmin,
        },
      });
    } catch (error) {
      console.error("UPDATE USER ROLE ERROR:", error.message);

      res.status(500).json({
        message: "Failed to update user role",
      });
    }
  },
);

// ==========================================
// GET ALL AI ANALYSES
// ==========================================

router.get("/analyses", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await removeOrphanAnalyses();

    const analyses = await Analysis.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const validAnalyses = analyses.filter((item) => item.user);

    res.status(200).json({
      analyses: validAnalyses,
    });
  } catch (error) {
    console.error("ADMIN ANALYSES ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get analyses",
    });
  }
});

module.exports = router;
