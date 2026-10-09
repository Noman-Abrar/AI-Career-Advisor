const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const Analysis = require("../models/Analysis");

const authMiddleware = require("../middleware/authMiddleware");
const generateCareerAnalysis = require("../services/aiService");

const router = express.Router();

// ===============================
// HELPERS
// ===============================

const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid analysis ID." });
  }

  next();
};

// Har user ke liye AI calls limit (paise bachane ke liye)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    message: "Too many analysis requests. Please try again in a few minutes.",
  },
});

// ===============================
// GENERATE AI CAREER ANALYSIS
// ===============================

router.post("/analyze", authMiddleware, analyzeLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const educationMissing = !user.education || user.education.trim() === "";

    const gpaMissing =
      user.gpa === undefined || user.gpa === null || user.gpa === 0;

    const skillsMissing =
      !Array.isArray(user.skills) || user.skills.length === 0;

    const interestsMissing =
      !Array.isArray(user.interests) || user.interests.length === 0;

    const careerGoalMissing = !user.careerGoal || user.careerGoal.trim() === "";

    if (
      educationMissing ||
      gpaMissing ||
      skillsMissing ||
      interestsMissing ||
      careerGoalMissing
    ) {
      return res.status(400).json({
        message:
          "Please complete your profile before generating career analysis.",
      });
    }

    const analysis = await generateCareerAnalysis(user);

    const roadmapProgress = Array.isArray(analysis.learningRoadmap)
      ? analysis.learningRoadmap.map((item, index) => ({
          step: Number(item.step) || index + 1,
          status: "not_started",
        }))
      : [];

    const savedAnalysis = await Analysis.create({
      user: user._id,

      profileSnapshot: {
        education: user.education,
        gpa: user.gpa,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
      },

      careerRecommendations: analysis.careerRecommendations,

      skillGaps: analysis.skillGaps,

      learningRoadmap: analysis.learningRoadmap,

      roadmapProgress,
    });

    res.status(200).json({
      message: "Career analysis generated successfully",

      analysis: {
        ...analysis,

        _id: savedAnalysis._id,

        user: savedAnalysis.user,

        profileSnapshot: savedAnalysis.profileSnapshot,

        roadmapProgress: savedAnalysis.roadmapProgress,

        createdAt: savedAnalysis.createdAt,
      },

      analysisId: savedAnalysis._id,
    });
  } catch (error) {
    console.error("AI ANALYSIS ERROR:", error.message);

    res.status(500).json({
      message: "Failed to generate career analysis",
    });
  }
});

// ===============================
// GET ANALYSIS HISTORY
// ===============================

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      analyses,
    });
  } catch (error) {
    console.error("HISTORY ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get analysis history",
    });
  }
});

// ===============================
// UPDATE ROADMAP PROGRESS
// ===============================

router.put(
  "/:id/roadmap-progress",
  authMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const { step, status } = req.body;

      if (!step || !Number.isInteger(Number(step))) {
        return res.status(400).json({
          message: "Valid roadmap step is required.",
        });
      }

      const roadmapStep = Number(step);

      const allowedStatuses = ["not_started", "in_progress", "completed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid status. Status must be not_started, in_progress, or completed.",
        });
      }

      const analysis = await Analysis.findById(req.params.id);

      if (!analysis) {
        return res.status(404).json({
          message: "Analysis not found.",
        });
      }

      if (analysis.user.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Access denied. You can only update your own roadmap.",
        });
      }

      const roadmapExists = analysis.learningRoadmap.some(
        (item) => Number(item.step) === roadmapStep,
      );

      if (!roadmapExists) {
        return res.status(400).json({
          message: "Roadmap step does not exist.",
        });
      }

      const existingProgressIndex = analysis.roadmapProgress.findIndex(
        (item) => Number(item.step) === roadmapStep,
      );

      if (existingProgressIndex !== -1) {
        analysis.roadmapProgress[existingProgressIndex].status = status;
      } else {
        analysis.roadmapProgress.push({
          step: roadmapStep,
          status,
        });
      }

      await analysis.save();

      res.status(200).json({
        message: "Roadmap progress updated successfully.",

        roadmapProgress: analysis.roadmapProgress,
      });
    } catch (error) {
      console.error("ROADMAP PROGRESS ERROR:", error.message);

      res.status(500).json({
        message: "Failed to update roadmap progress",
      });
    }
  },
);

// ===============================
// DELETE ANALYSIS
// ===============================

router.delete("/:id", authMiddleware, validateObjectId, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found",
      });
    }

    if (analysis.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own analysis.",
      });
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ANALYSIS ERROR:", error.message);

    res.status(500).json({
      message: "Failed to delete analysis",
    });
  }
});

module.exports = router;
