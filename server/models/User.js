const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==============================
    // BASIC ACCOUNT INFORMATION
    // ==============================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Google users ka password nahi hota, is liye sirf local users ke liye required
    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
    },

    // ==============================
    // LOGIN PROVIDER (GOOGLE)
    // ==============================

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ==============================
    // CAREER PROFILE
    // ==============================

    education: {
      type: String,
      default: "",
      trim: true,
    },

    gpa: {
      type: Number,
      default: null,
      min: 0,
      max: 4,
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    careerGoal: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // AUTHORIZATION
    // ==============================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
