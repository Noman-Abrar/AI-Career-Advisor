const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // User ki us waqt wali profile ka snapshot
    profileSnapshot: {
      education: {
        type: String,
        default: "",
      },

      gpa: {
        type: Number,
        default: 0,
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
      },
    },

    // AI generated career recommendations
    careerRecommendations: [
      {
        title: {
          type: String,
          required: true,
        },

        reason: {
          type: String,
          default: "",
        },
      },
    ],

    // AI generated skill gaps
    skillGaps: {
      type: [String],
      default: [],
    },

    // AI generated roadmap
    learningRoadmap: [
      {
        step: Number,

        title: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },
      },
    ],

    // ===============================
    // ROADMAP PROGRESS
    // ===============================

    roadmapProgress: [
      {
        step: {
          type: Number,
          required: true,
        },

        status: {
          type: String,
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started",
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

const Analysis = mongoose.model("Analysis", analysisSchema);

module.exports = Analysis;
