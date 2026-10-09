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

    password: {
      type: String,
      required: true,
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
