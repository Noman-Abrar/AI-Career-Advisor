const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// HELPERS
// ==========================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const MAX_PASSWORD_LENGTH = 72;

const isValidPasswordInput = (value) =>
  typeof value === "string" && value.length <= MAX_PASSWORD_LENGTH;

// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      education,
      gpa,
      skills,
      interests,
      careerGoal,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (!isValidPasswordInput(password)) {
      return res.status(400).json({
        message: `Password must be a string up to ${MAX_PASSWORD_LENGTH} characters.`,
      });
    }

    const trimmedName = String(name).trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    let normalizedGpa = 0;

    if (gpa !== undefined && gpa !== null && gpa !== "") {
      normalizedGpa = Number(gpa);

      if (
        Number.isNaN(normalizedGpa) ||
        normalizedGpa < 0 ||
        normalizedGpa > 4
      ) {
        return res.status(400).json({
          message: "GPA must be between 0 and 4.",
        });
      }
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const normalizedInterests = Array.isArray(interests)
      ? interests
          .filter((interest) => typeof interest === "string")
          .map((interest) => interest.trim())
          .filter(Boolean)
      : [];

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,

      education: typeof education === "string" ? education.trim() : "",

      gpa: normalizedGpa,

      skills: normalizedSkills,

      interests: normalizedInterests,

      careerGoal: typeof careerGoal === "string" ? careerGoal.trim() : "",

      role: "user",

      isSuperAdmin: false,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(201).json({
      message: "Account created successfully.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        education: user.education,
        gpa: user.gpa,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!isValidPasswordInput(password)) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        education: user.education,
        gpa: user.gpa,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// ==========================================
// GET PROFILE
// ==========================================

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile accessed successfully",
      user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error.message);

    return res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, education, gpa, skills, interests, careerGoal } =
      req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    const normalizedName = name.trim();

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: {
        $ne: req.user.userId,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already being used by another account.",
      });
    }

    const normalizedGpa = Number(gpa);

    if (Number.isNaN(normalizedGpa) || normalizedGpa < 0 || normalizedGpa > 4) {
      return res.status(400).json({
        message: "GPA must be between 0 and 4.",
      });
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const normalizedInterests = Array.isArray(interests)
      ? interests
          .filter((interest) => typeof interest === "string")
          .map((interest) => interest.trim())
          .filter(Boolean)
      : [];

    // role aur isSuperAdmin yahan intentionally accept nahi kiye ja rahe.
    const updateData = {
      name: normalizedName,
      email: normalizedEmail,
      education: typeof education === "string" ? education.trim() : "",
      gpa: normalizedGpa,
      skills: normalizedSkills,
      interests: normalizedInterests,
      careerGoal: typeof careerGoal === "string" ? careerGoal.trim() : "",
    };

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This email is already being used by another account.",
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (
      !isValidPasswordInput(currentPassword) ||
      !isValidPasswordInput(newPassword)
    ) {
      return res.status(400).json({
        message: `Passwords must be strings up to ${MAX_PASSWORD_LENGTH} characters.`,
      });
    }

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const currentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!currentPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error.message);

    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
});

// ==========================================
// ADMIN
// ==========================================

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Welcome Admin!",
  });
});

module.exports = router;
