import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

import {
  User,
  LogOut,
  Sparkles,
  Lock,
  Target,
  Brain,
  TrendingUp,
  BookOpen,
  X,
  Save,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Zap,
  ChevronRight,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from "lucide-react";

import "./Dashboard.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toArray = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Login karne wale ka role: Super Admin / Admin / User
const getRoleLabel = (user) => {
  let tokenData = {};
  let stored = {};

  try {
    const t = localStorage.getItem("token");
    if (t) {
      tokenData =
        JSON.parse(
          atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        ) || {};
    }
  } catch (e) {}

  try {
    stored = JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {}

  const sources = [user, stored, tokenData, tokenData.user].filter(Boolean);

  const norm = (v) =>
    String(v || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const isSuper = sources.some(
    (s) =>
      s.isSuperAdmin === true ||
      s.isSuperAdmin === "true" ||
      norm(s.role) === "superadmin",
  );

  if (isSuper) return "Super Admin";

  if (sources.some((s) => norm(s.role) === "admin")) return "Admin";

  return "User";
};

const Dashboard = () => {
  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(null);

  // ==========================================
  // PROFILE MODAL
  // ==========================================

  const [showProfile, setShowProfile] = useState(false);

  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    education: "",
    gpa: "",
    skills: "",
    interests: "",
    careerGoal: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  // ==========================================
  // AI ANALYSIS
  // ==========================================

  const [analysis, setAnalysis] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // ==========================================
  // ANALYSIS HISTORY
  // ==========================================

  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // ==========================================
  // ROADMAP
  // ==========================================

  const [updatingRoadmap, setUpdatingRoadmap] = useState(null);

  // ==========================================
  // DELETE
  // ==========================================

  const [deletingAnalysis, setDeletingAnalysis] = useState(null);

  // ==========================================
  // COMMON ERROR HANDLER
  // ==========================================

  const handleUnauthorized = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return true;
    }

    return false;
  };

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
    } catch (error) {
      handleUnauthorized(error);
    }
  };

  // ==========================================
  // FETCH AI HISTORY
  // ==========================================

  const fetchAnalysisHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${API_URL}/ai/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const analyses = response.data.analyses || [];
      setAnalysisHistory(analyses);

      // ==========================================
      // RESTORE LATEST ANALYSIS
      // ==========================================

      if (analyses.length > 0) {
        setAnalysis((currentAnalysis) => {
          if (!currentAnalysis) {
            return analyses[0];
          }

          const stillExists = analyses.find(
            (item) => item._id === currentAnalysis._id,
          );

          return stillExists || analyses[0];
        });

        setSelectedAnalysis((currentAnalysis) => {
          if (!currentAnalysis) {
            return analyses[0];
          }

          const stillExists = analyses.find(
            (item) => item._id === currentAnalysis._id,
          );

          return stillExists || analyses[0];
        });
      } else {
        setAnalysis(null);
        setSelectedAnalysis(null);
      }
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setHistoryError(
        error.response?.data?.message || "Failed to load analysis history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProfile();
    fetchAnalysisHistory();
  }, []);

  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const handleEditProfile = () => {
    setEditProfile({
      name: user?.name || "",
      email: user?.email || "",
      education: user?.education || "",
      gpa: user?.gpa ?? "",
      skills: user?.skills?.join(", ") || "",
      interests: user?.interests?.join(", ") || "",
      careerGoal: user?.careerGoal || "",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage("");
    setPasswordError("");
    setProfileMessage("");
    setProfileError("");

    setShowProfile(true);
  };

  // ==========================================
  // PROFILE CHANGE
  // ==========================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setEditProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async () => {
    try {
      setProfileMessage("");
      setProfileError("");

      const name = editProfile.name.trim();
      const email = editProfile.email.trim();

      if (!name) {
        setProfileError("Please enter your full name.");
        return;
      }

      if (!email || !EMAIL_REGEX.test(email)) {
        setProfileError("Please enter a valid email address.");
        return;
      }

      let gpa = null;

      if (String(editProfile.gpa).trim() !== "") {
        gpa = Number(editProfile.gpa);

        if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) {
          setProfileError("GPA must be a number between 0 and 4.");
          return;
        }
      }

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      setSavingProfile(true);

      const payload = {
        name,
        email,
        education: editProfile.education.trim(),
        gpa,
        skills: toArray(editProfile.skills),
        interests: toArray(editProfile.interests),
        careerGoal: editProfile.careerGoal.trim(),
      };

      const response = await axios.put(`${API_URL}/auth/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.user || { ...user, ...payload });

      setProfileMessage(
        response.data.message || "Profile updated successfully.",
      );
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setProfileError(
        error.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = async () => {
    try {
      setPasswordMessage("");
      setPasswordError("");

      if (!passwordData.currentPassword) {
        setPasswordError("Please enter your current password.");
        return;
      }

      if (!passwordData.newPassword) {
        setPasswordError("Please enter your new password.");
        return;
      }

      if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
        setPasswordError(
          "Password must contain at least 8 characters, including uppercase, lowercase, number and special character.",
        );
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }

      setChangingPassword(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        response.data.message || "Password changed successfully.",
      );
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setPasswordError(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // GENERATE AI ANALYSIS
  // ==========================================

  const handleViewRecommendation = async () => {
    try {
      setAnalysisError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setAnalysisError("Please login first.");
        return;
      }

      // ==========================================
      // GET LATEST PROFILE
      // ==========================================

      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latestUser = profileResponse.data.user;
      // ==========================================
      // PROFILE VALIDATION
      // ==========================================

      const educationMissing =
        !latestUser.education || latestUser.education.trim() === "";

      const gpaMissing =
        latestUser.gpa === undefined ||
        latestUser.gpa === null ||
        latestUser.gpa === 0;

      const skillsMissing =
        !Array.isArray(latestUser.skills) || latestUser.skills.length === 0;

      const interestsMissing =
        !Array.isArray(latestUser.interests) ||
        latestUser.interests.length === 0;

      const careerGoalMissing =
        !latestUser.careerGoal || latestUser.careerGoal.trim() === "";

      if (
        educationMissing ||
        gpaMissing ||
        skillsMissing ||
        interestsMissing ||
        careerGoalMissing
      ) {
        setAnalysisError(
          "Please complete your profile before generating your career analysis.",
        );

        return;
      }

      // ==========================================
      // UPDATE USER
      // ==========================================

      setUser(latestUser);

      // ==========================================
      // START ANALYSIS
      // ==========================================

      setIsAnalyzing(true);

      setAnalysis(null);
      setSelectedAnalysis(null);

      // ==========================================
      // CALL AI API
      // ==========================================

      const response = await axios.post(
        `${API_URL}/ai/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const newAnalysis = response.data.analysis;

      // ==========================================
      // SET ANALYSIS
      // ==========================================

      setAnalysis(newAnalysis);
      setSelectedAnalysis(newAnalysis);

      // ==========================================
      // REFRESH HISTORY
      // ==========================================

      await fetchAnalysisHistory();
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setAnalysisError(
        error.response?.data?.message || "Failed to generate career analysis.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==========================================
  // ROADMAP STATUS UPDATE
  // ==========================================

  const handleRoadmapStatusChange = async (analysisId, step, status) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      setUpdatingRoadmap(`${analysisId}-${step}`);

      const response = await axios.put(
        `${API_URL}/ai/${analysisId}/roadmap-progress`,
        {
          step,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const updatedProgress = response.data.roadmapProgress || [];

      // ==========================================
      // UPDATE CURRENT ANALYSIS
      // ==========================================

      setAnalysis((currentAnalysis) => {
        if (!currentAnalysis || currentAnalysis._id !== analysisId) {
          return currentAnalysis;
        }

        return {
          ...currentAnalysis,
          roadmapProgress: updatedProgress,
        };
      });

      // ==========================================
      // UPDATE SELECTED ANALYSIS
      // ==========================================

      setSelectedAnalysis((currentAnalysis) => {
        if (!currentAnalysis || currentAnalysis._id !== analysisId) {
          return currentAnalysis;
        }

        return {
          ...currentAnalysis,
          roadmapProgress: updatedProgress,
        };
      });

      // ==========================================
      // UPDATE HISTORY
      // ==========================================

      setAnalysisHistory((currentHistory) =>
        currentHistory.map((item) =>
          item._id === analysisId
            ? {
                ...item,
                roadmapProgress: updatedProgress,
              }
            : item,
        ),
      );
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      alert(
        error.response?.data?.message || "Failed to update roadmap progress.",
      );
    } finally {
      setUpdatingRoadmap(null);
    }
  };

  // ==========================================
  // DOWNLOAD PDF CAREER REPORT
  // ==========================================

  const handleDownloadReport = () => {
    if (!analysis) {
      return;
    }

    try {
      const doc = new jsPDF();

      const profile = analysis.profileSnapshot || user || {};

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      let y = 20;

      // ==========================================
      // HELPERS
      // ==========================================

      const addText = (
        text,
        x = 20,
        fontSize = 10,
        maxWidth = 170,
        lineHeight = 6,
      ) => {
        doc.setFontSize(fontSize);

        const lines = doc.splitTextToSize(String(text || ""), maxWidth);

        doc.text(lines, x, y);

        y += lines.length * lineHeight;

        return lines.length;
      };

      const addHeading = (text, fontSize = 15) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        doc.setFont(undefined, "bold");
        doc.setFontSize(fontSize);

        doc.text(text, 20, y);

        y += 9;

        doc.setFont(undefined, "normal");
      };

      const addSectionSpacing = () => {
        y += 5;

        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
      };

      const checkPageSpace = (requiredSpace = 20) => {
        if (y > pageHeight - requiredSpace) {
          doc.addPage();
          y = 20;
        }
      };

      // ==========================================
      // HEADER
      // ==========================================

      doc.setFont(undefined, "bold");
      doc.setFontSize(24);

      doc.text("CareerAI", 20, y);

      y += 9;

      doc.setFont(undefined, "normal");
      doc.setFontSize(11);

      doc.text("Career Intelligence Report", 20, y);

      y += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);

      doc.setTextColor(0, 0, 0);

      y += 12;

      // ==========================================
      // PROFILE
      // ==========================================

      addHeading("Student Profile");

      doc.setFont(undefined, "bold");

      addText(`Name: ${profile.name || user?.name || "Not provided"}`);

      doc.setFont(undefined, "normal");

      addText(`Education: ${profile.education || "Not provided"}`);

      addText(
        `GPA: ${
          profile.gpa !== undefined &&
          profile.gpa !== null &&
          profile.gpa !== ""
            ? profile.gpa
            : "Not provided"
        }`,
      );

      addText(`Career Goal: ${profile.careerGoal || "Not provided"}`);

      addText(
        `Skills: ${
          profile.skills?.length ? profile.skills.join(", ") : "Not provided"
        }`,
      );

      addText(
        `Interests: ${
          profile.interests?.length
            ? profile.interests.join(", ")
            : "Not provided"
        }`,
      );

      addSectionSpacing();

      // ==========================================
      // CAREER RECOMMENDATIONS
      // ==========================================

      addHeading("Career Recommendations");

      if (
        Array.isArray(analysis.careerRecommendations) &&
        analysis.careerRecommendations.length > 0
      ) {
        analysis.careerRecommendations.forEach((career, index) => {
          checkPageSpace(35);

          doc.setFont(undefined, "bold");
          doc.setFontSize(11);

          addText(
            `${index + 1}. ${career.title || "Career Recommendation"}`,
            20,
            11,
            170,
            6,
          );

          doc.setFont(undefined, "normal");

          addText(
            career.reason || "No explanation available.",
            27,
            10,
            163,
            5.5,
          );

          y += 3;
        });
      } else {
        addText("No career recommendations available.");
      }

      addSectionSpacing();

      // ==========================================
      // SKILL GAPS
      // ==========================================

      addHeading("Skill Gap Analysis");

      if (Array.isArray(analysis.skillGaps) && analysis.skillGaps.length > 0) {
        analysis.skillGaps.forEach((skill, index) => {
          checkPageSpace(15);

          doc.setFontSize(10);

          doc.text(`${index + 1}. ${skill}`, 25, y);

          y += 7;
        });
      } else {
        addText("No skill gaps available.");
      }

      addSectionSpacing();

      // ==========================================
      // ROADMAP
      // ==========================================

      addHeading("Learning Roadmap");

      if (
        Array.isArray(analysis.learningRoadmap) &&
        analysis.learningRoadmap.length > 0
      ) {
        analysis.learningRoadmap.forEach((item, index) => {
          checkPageSpace(40);

          doc.setFont(undefined, "bold");
          doc.setFontSize(11);

          addText(
            `Phase ${index + 1}: ${item.title || "Learning Phase"}`,
            20,
            11,
            170,
            6,
          );

          doc.setFont(undefined, "normal");

          addText(
            item.description || "No description available.",
            27,
            10,
            163,
            5.5,
          );

          y += 4;
        });
      } else {
        addText("No learning roadmap available.");
      }

      addSectionSpacing();

      // ==========================================
      // FINAL MESSAGE
      // ==========================================

      checkPageSpace(45);

      addHeading("CareerAI Guidance");

      addText(
        "Use this roadmap as a structured guide for developing the skills required for your target career. Continue improving your practical skills and build real-world projects as you progress.",
        20,
        10,
        170,
        5.5,
      );

      // ==========================================
      // PAGE NUMBERS
      // ==========================================

      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFont(undefined, "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `CareerAI • Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          {
            align: "center",
          },
        );
      }

      // ==========================================
      // DOWNLOAD
      // ==========================================

      const safeName = (user?.name || "Career-Report")
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-");

      doc.save(`CareerAI-${safeName}.pdf`);
    } catch (error) {
      alert("Failed to generate career report.");
    }
  };

  // ==========================================
  // DELETE ANALYSIS
  // ==========================================

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this analysis?",
      );

      if (!confirmed) {
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      setDeletingAnalysis(analysisId);

      await axios.delete(`${API_URL}/ai/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ==========================================
      // REMOVE FROM HISTORY
      // ==========================================

      setAnalysisHistory((currentHistory) =>
        currentHistory.filter((item) => item._id !== analysisId),
      );

      // ==========================================
      // CURRENT ANALYSIS
      // ==========================================

      if (analysis?._id === analysisId) {
        setAnalysis(null);
      }

      // ==========================================
      // SELECTED ANALYSIS
      // ==========================================

      if (selectedAnalysis?._id === analysisId) {
        setSelectedAnalysis(null);
      }

      // ==========================================
      // REFRESH HISTORY
      // ==========================================

      await fetchAnalysisHistory();
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      alert(error.response?.data?.message || "Failed to delete analysis.");
    } finally {
      setDeletingAnalysis(null);
    }
  };

  // ==========================================
  // SELECT HISTORY ITEM
  // ==========================================

  const handleSelectAnalysis = (item) => {
    setAnalysis(item);
    setSelectedAnalysis(item);
    setAnalysisError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="loading-orb">
          <Sparkles size={30} />
        </div>

        <h2>Initializing CareerAI</h2>

        <p>Preparing your personalized career space...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="dashboard-page">
      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="background-grid"></div>

      <div className="floating-orb orb-one"></div>
      <div className="floating-orb orb-two"></div>
      <div className="floating-orb orb-three"></div>

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={21} />
          </div>

          <span>
            Career<span>AI</span>
          </span>
        </div>

        <div className="sidebar-menu">
          <div className="menu-title">WORKSPACE</div>

          <button
            className="sidebar-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <Target size={18} />
            Career Analysis
          </button>

          <button className="sidebar-item" onClick={handleEditProfile}>
            <User size={18} />
            My Profile
          </button>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="mini-user">
            <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>

            <div>
              <strong>{user.name}</strong>

              <span>{user.careerGoal || "Student"}</span>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "6px",
                  padding: "3px 9px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: ".04em",
                  background:
                    getRoleLabel(user) === "Super Admin"
                      ? "rgba(139, 92, 246, 0.15)"
                      : getRoleLabel(user) === "Admin"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(148, 163, 184, 0.15)",
                  color:
                    getRoleLabel(user) === "Super Admin"
                      ? "#a78bfa"
                      : getRoleLabel(user) === "Admin"
                        ? "#60a5fa"
                        : "#94a3b8",
                  border:
                    getRoleLabel(user) === "Super Admin"
                      ? "1px solid rgba(139, 92, 246, 0.3)"
                      : getRoleLabel(user) === "Admin"
                        ? "1px solid rgba(59, 130, 246, 0.3)"
                        : "1px solid rgba(148, 163, 184, 0.3)",
                }}
              >
                <Lock size={10} />
                {getRoleLabel(user)}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="main-content">
        {/* ==========================================
            TOP BAR
        ========================================== */}

        <header className="topbar">
          <div>
            <div className="eyebrow">
              <span className="pulse-dot"></span>
              AI CAREER INTELLIGENCE
            </div>

            <h1>
              Welcome back, <span>{user.name}</span>
            </h1>

            <p>Your personalized career intelligence workspace.</p>
          </div>

          <button className="profile-button" onClick={handleEditProfile}>
            <User size={17} />
            Profile
          </button>
        </header>

        {/* ==========================================
            PROFILE HERO
        ========================================== */}

        <section className="profile-hero glass-card">
          <div className="hero-glow"></div>

          <div className="profile-main">
            <div className="large-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <span className="profile-label">CURRENT CAREER DIRECTION</span>

              <h2>{user.careerGoal || "Career Goal Not Set"}</h2>

              <p>{user.education || "Education not provided"}</p>
            </div>
          </div>

          <div className="profile-stats">
            <StatCard
              icon={<GraduationCap size={18} />}
              label="Education"
              value={user.education || "Not set"}
            />

            <StatCard
              icon={<TrendingUp size={18} />}
              label="GPA"
              value={user.gpa || "Not set"}
            />

            <StatCard
              icon={<Brain size={18} />}
              label="Interests"
              value={
                user.interests?.length ? user.interests.join(", ") : "Not set"
              }
            />
          </div>
        </section>

        {/* ==========================================
            AI HERO
        ========================================== */}

        {!analysis && (
          <section className="ai-hero glass-card">
            <div className="ai-visual">
              <div className="ai-ring ring-one"></div>
              <div className="ai-ring ring-two"></div>
              <div className="ai-ring ring-three"></div>

              <div className="ai-core">
                <Sparkles size={34} />
              </div>
            </div>

            <div className="ai-hero-content">
              <div className="ai-badge">
                <Zap size={14} />
                AI POWERED
              </div>

              <h2>
                Discover your
                <span> career path.</span>
              </h2>

              <p>
                CareerAI analyzes your education, skills, interests and goals to
                create a personalized career strategy.
              </p>

              <button
                className="generate-button"
                onClick={handleViewRecommendation}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <span className="button-loader"></span>
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    Generate Career Analysis
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {analysisError && (
                <div className="error-message">{analysisError}</div>
              )}
            </div>
          </section>
        )}

        {/* ==========================================
            ANALYZING
        ========================================== */}

        {isAnalyzing && (
          <div className="analysis-loading glass-card">
            <div className="loading-ai-icon">
              <Sparkles size={25} />
            </div>

            <div>
              <h3>CareerAI is analyzing your profile</h3>

              <p>Evaluating your skills, interests and career direction...</p>
            </div>

            <div className="loading-bars">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* ==========================================
            AI RESULTS
        ========================================== */}

        {analysis && (
          <div className="results-container">
            {/* ==========================================
                RESULT HEADER
            ========================================== */}

            <div className="results-header">
              <div>
                <div className="ai-badge">
                  <Sparkles size={14} />
                  AI GENERATED ANALYSIS
                </div>

                <h2>Your Career Intelligence Report</h2>

                <p>
                  Personalized insights generated from your current profile.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="new-analysis"
                  onClick={handleDownloadReport}
                  disabled={!analysis}
                >
                  <BookOpen size={16} />
                  Download Report
                </button>

                <button
                  className="new-analysis"
                  onClick={handleViewRecommendation}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={16} className="loading-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Regenerate
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysisError && (
              <div className="error-message">{analysisError}</div>
            )}

            {/* ==========================================
                CAREER RECOMMENDATIONS
            ========================================== */}

            <section className="result-section">
              <SectionTitle
                icon={<Target size={20} />}
                title="Career Recommendations"
                description="Career paths aligned with your profile and goals."
              />

              <div className="career-grid">
                {analysis.careerRecommendations?.map((career, index) => (
                  <div className="career-card" key={career.title || index}>
                    <div className="card-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="card-icon">
                      <Target size={20} />
                    </div>

                    <h3>{career.title}</h3>

                    <p>{career.reason}</p>

                    <div className="card-arrow">
                      <ChevronRight size={17} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ==========================================
                SKILL GAPS
            ========================================== */}

            <section className="result-section">
              <SectionTitle
                icon={<Brain size={20} />}
                title="Skill Gap Analysis"
                description="Capabilities to develop for your target career."
              />

              <div className="skills-panel glass-card">
                {analysis.skillGaps?.map((skill, index) => (
                  <div className="skill-chip" key={`${skill}-${index}`}>
                    <CheckCircle2 size={16} />

                    {skill}
                  </div>
                ))}
              </div>
            </section>

            {/* ==========================================
                LEARNING ROADMAP
            ========================================== */}

            <section className="result-section">
              <SectionTitle
                icon={<BookOpen size={20} />}
                title="Learning Roadmap"
                description="A structured path from your current level to career readiness."
              />

              <div
                className="roadmap"
                style={{
                  perspective: "1200px",
                }}
              >
                {analysis.learningRoadmap?.map((item, index) => {
                  const roadmapStep = Number(item.step || index + 1);

                  const progressItem = analysis.roadmapProgress?.find(
                    (progress) => Number(progress.step) === roadmapStep,
                  );

                  const currentStatus = progressItem?.status || "not_started";

                  const isInProgress = currentStatus === "in_progress";

                  const isCompleted = currentStatus === "completed";

                  const isUpdating =
                    updatingRoadmap === `${analysis._id}-${roadmapStep}`;

                  return (
                    <div
                      key={item.step || index}
                      className="roadmap-item"
                      style={{
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform .45s ease, filter .45s ease",
                        animation: `roadmapFloat 4s ease-in-out ${
                          index * 0.18
                        }s infinite alternate`,
                        filter: isCompleted
                          ? "drop-shadow(0 0 14px rgba(52,211,153,.14))"
                          : isInProgress
                            ? "drop-shadow(0 0 18px rgba(124,92,255,.16))"
                            : "none",
                        opacity: isUpdating ? 0.65 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "perspective(1000px) rotateX(2deg) rotateY(-1deg) translate3d(8px,-5px,18px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "";
                      }}
                    >
                      <div className="roadmap-line"></div>

                      {/* NUMBER */}

                      <div
                        className="roadmap-number"
                        style={{
                          position: "relative",
                          zIndex: 3,
                          transform: isInProgress
                            ? "translateZ(22px)"
                            : isCompleted
                              ? "translateZ(16px)"
                              : "translateZ(8px)",
                          transition: "all .4s ease",
                          boxShadow: isCompleted
                            ? "0 0 28px rgba(52,211,153,.28), inset 0 0 20px rgba(52,211,153,.08)"
                            : isInProgress
                              ? "0 0 30px rgba(124,92,255,.30), inset 0 0 20px rgba(124,92,255,.08)"
                              : "0 10px 25px rgba(0,0,0,.18)",
                          border: isCompleted
                            ? "1px solid rgba(52,211,153,.45)"
                            : isInProgress
                              ? "1px solid rgba(124,92,255,.55)"
                              : undefined,
                          color: isCompleted
                            ? "#6ee7b7"
                            : isInProgress
                              ? "#b8a9ff"
                              : undefined,
                          animation: isInProgress
                            ? "roadmapPulse 2s ease-in-out infinite"
                            : isCompleted
                              ? "completedPulse 3s ease-in-out infinite"
                              : "none",
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </div>

                      {/* CONTENT */}

                      <div
                        className="roadmap-content"
                        style={{
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transition: "all .4s ease",
                          boxShadow: isCompleted
                            ? "0 0 35px rgba(52,211,153,.045), inset 0 1px rgba(255,255,255,.04)"
                            : isInProgress
                              ? "0 0 40px rgba(124,92,255,.055), inset 0 1px rgba(255,255,255,.04)"
                              : undefined,
                        }}
                      >
                        {/* TOP */}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "15px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <span>PHASE {index + 1}</span>

                            <h3>{item.title}</h3>
                          </div>

                          {/* STATUS */}

                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "7px",
                              padding: "6px 10px",
                              borderRadius: "9px",
                              fontSize: "11px",
                              fontWeight: "700",
                              border: isCompleted
                                ? "1px solid rgba(52,211,153,.22)"
                                : isInProgress
                                  ? "1px solid rgba(124,92,255,.25)"
                                  : "1px solid rgba(255,255,255,.07)",
                              background: isCompleted
                                ? "rgba(52,211,153,.07)"
                                : isInProgress
                                  ? "rgba(124,92,255,.08)"
                                  : "rgba(255,255,255,.025)",
                              color: isCompleted
                                ? "#6ee7b7"
                                : isInProgress
                                  ? "#b8a9ff"
                                  : "#737c90",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: isCompleted
                                  ? "#34d399"
                                  : isInProgress
                                    ? "#8d72ff"
                                    : "#596174",
                                boxShadow: isCompleted
                                  ? "0 0 9px rgba(52,211,153,.8)"
                                  : isInProgress
                                    ? "0 0 10px rgba(124,92,255,.9)"
                                    : "none",
                                animation: isInProgress
                                  ? "statusBlink 1.4s ease-in-out infinite"
                                  : "none",
                              }}
                            />

                            {isCompleted
                              ? "Completed"
                              : isInProgress
                                ? "In Progress"
                                : "Not Started"}
                          </div>
                        </div>

                        <p>{item.description}</p>

                        {/* STATUS BUTTONS */}

                        <div
                          style={{
                            marginTop: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleRoadmapStatusChange(
                                analysis._id,
                                roadmapStep,
                                "not_started",
                              )
                            }
                            style={{
                              padding: "7px 10px",
                              borderRadius: "8px",
                              border:
                                currentStatus === "not_started"
                                  ? "1px solid rgba(255,255,255,.15)"
                                  : "1px solid rgba(255,255,255,.06)",
                              background:
                                currentStatus === "not_started"
                                  ? "rgba(255,255,255,.07)"
                                  : "rgba(255,255,255,.025)",
                              color:
                                currentStatus === "not_started"
                                  ? "#d7dbe5"
                                  : "#667085",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                            }}
                          >
                            Not Started
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleRoadmapStatusChange(
                                analysis._id,
                                roadmapStep,
                                "in_progress",
                              )
                            }
                            style={{
                              padding: "7px 10px",
                              borderRadius: "8px",
                              border:
                                currentStatus === "in_progress"
                                  ? "1px solid rgba(124,92,255,.42)"
                                  : "1px solid rgba(255,255,255,.06)",
                              background:
                                currentStatus === "in_progress"
                                  ? "rgba(124,92,255,.12)"
                                  : "rgba(255,255,255,.025)",
                              color:
                                currentStatus === "in_progress"
                                  ? "#c8bfff"
                                  : "#667085",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                            }}
                          >
                            In Progress
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleRoadmapStatusChange(
                                analysis._id,
                                roadmapStep,
                                "completed",
                              )
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "7px 10px",
                              borderRadius: "8px",
                              border:
                                currentStatus === "completed"
                                  ? "1px solid rgba(52,211,153,.32)"
                                  : "1px solid rgba(255,255,255,.06)",
                              background:
                                currentStatus === "completed"
                                  ? "rgba(52,211,153,.09)"
                                  : "rgba(255,255,255,.025)",
                              color:
                                currentStatus === "completed"
                                  ? "#6ee7b7"
                                  : "#667085",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: isUpdating ? "not-allowed" : "pointer",
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Completed
                          </button>
                        </div>

                        {/* PROGRESS BAR */}

                        <div
                          style={{
                            width: "100%",
                            height: "3px",
                            marginTop: "14px",
                            borderRadius: "20px",
                            overflow: "hidden",
                            background: "rgba(255,255,255,.045)",
                            transform: "translateZ(5px)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: "inherit",
                              width: isCompleted
                                ? "100%"
                                : isInProgress
                                  ? "55%"
                                  : "0%",
                              background: isCompleted
                                ? "linear-gradient(90deg,#238c6b,#34d399,#75e6ba)"
                                : "linear-gradient(90deg,#6851d7,#9b83ff,#6f9eff)",
                              backgroundSize: "200% 100%",
                              boxShadow: isCompleted
                                ? "0 0 15px rgba(52,211,153,.5)"
                                : isInProgress
                                  ? "0 0 14px rgba(124,92,255,.55)"
                                  : "none",
                              transition: "width .7s cubic-bezier(.22,1,.36,1)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ROADMAP ANIMATIONS */}

              <style>
                {`
                  @keyframes roadmapFloat {
                    0% {
                      transform: translateY(0) translateZ(0);
                    }

                    100% {
                      transform: translateY(-3px) translateZ(4px);
                    }
                  }

                  @keyframes roadmapPulse {
                    0%,
                    100% {
                      box-shadow:
                        0 0 18px rgba(124,92,255,.12),
                        inset 0 0 15px rgba(124,92,255,.05);
                    }

                    50% {
                      box-shadow:
                        0 0 38px rgba(124,92,255,.38),
                        inset 0 0 24px rgba(124,92,255,.12);
                    }
                  }

                  @keyframes completedPulse {
                    0%,
                    100% {
                      transform:
                        translateZ(12px)
                        scale(1);
                    }

                    50% {
                      transform:
                        translateZ(20px)
                        scale(1.05);
                    }
                  }

                  @keyframes statusBlink {
                    0%,
                    100% {
                      opacity: .5;
                      transform: scale(.8);
                    }

                    50% {
                      opacity: 1;
                      transform: scale(1.2);
                    }
                  }

                  @keyframes progressFlow {
                    from {
                      background-position: 0% 0;
                    }

                    to {
                      background-position: 200% 0;
                    }
                  }
                `}
              </style>
            </section>

            {/* ==========================================
                FINAL CTA
            ========================================== */}

            <section className="final-cta glass-card">
              <div className="cta-icon">
                <Lightbulb size={25} />
              </div>

              <div>
                <h3>Your career journey starts here.</h3>

                <p>
                  Keep improving your skills and use your roadmap as a guide
                  toward your target role.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ==========================================
            PROFILE SNAPSHOT
        ========================================== */}

        {selectedAnalysis?.profileSnapshot && (
          <section className="result-section">
            <SectionTitle
              icon={<User size={20} />}
              title="Profile Used for This Analysis"
              description="Profile information that was used when this analysis was generated."
            />

            <div className="skills-panel glass-card">
              <div className="skill-chip">
                <div>
                  <strong>Education</strong>

                  <span>
                    {selectedAnalysis.profileSnapshot.education ||
                      "Not provided"}
                  </span>
                </div>
              </div>

              <div className="skill-chip">
                <div>
                  <strong>GPA</strong>

                  <span>
                    {selectedAnalysis.profileSnapshot.gpa || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="skill-chip">
                <div>
                  <strong>Skills</strong>

                  <span>
                    {selectedAnalysis.profileSnapshot.skills?.length
                      ? selectedAnalysis.profileSnapshot.skills.join(", ")
                      : "Not provided"}
                  </span>
                </div>
              </div>

              <div className="skill-chip">
                <div>
                  <strong>Interests</strong>

                  <span>
                    {selectedAnalysis.profileSnapshot.interests?.length
                      ? selectedAnalysis.profileSnapshot.interests.join(", ")
                      : "Not provided"}
                  </span>
                </div>
              </div>

              <div className="skill-chip">
                <div>
                  <strong>Career Goal</strong>

                  <span>
                    {selectedAnalysis.profileSnapshot.careerGoal ||
                      "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            ANALYSIS HISTORY
        ========================================== */}

        {analysisHistory.length > 0 && (
          <section className="result-section">
            <SectionTitle
              icon={<BookOpen size={20} />}
              title="Analysis History"
              description="Your previously generated career analyses."
            />

            <div className="skills-panel glass-card">
              {analysisHistory.map((item, index) => (
                <div
                  className="skill-chip"
                  key={item._id || index}
                  style={{
                    cursor: "pointer",
                    opacity: deletingAnalysis === item._id ? 0.5 : 1,
                  }}
                  onClick={() => {
                    handleSelectAnalysis(item);
                  }}
                >
                  <CheckCircle2 size={16} />

                  <div>
                    <strong>Analysis #{analysisHistory.length - index}</strong>

                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Unknown date"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleDeleteAnalysis(item._id);
                    }}
                    title="Delete analysis"
                    disabled={deletingAnalysis === item._id}
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {deletingAnalysis === item._id ? (
                      <RefreshCw size={16} className="loading-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================
            HISTORY LOADING
        ========================================== */}

        {historyLoading && (
          <div className="analysis-loading glass-card">
            <div className="loading-ai-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h3>Loading analysis history</h3>

              <p>Fetching your previous career analyses...</p>
            </div>
          </div>
        )}

        {/* ==========================================
            HISTORY ERROR
        ========================================== */}

        {historyError && <div className="error-message">{historyError}</div>}
      </main>

      {/* ==========================================
          PROFILE MODAL
      ========================================== */}

      {showProfile && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfile(false);
            }
          }}
        >
          <div className="profile-modal">
            {/* ==========================================
                MODAL HEADER
            ========================================== */}

            <div className="modal-header">
              <div>
                <span>ACCOUNT & CAREER PROFILE</span>

                <h2>Manage your profile</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowProfile(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* ==========================================
                PERSONAL INFORMATION
            ========================================== */}

            <div className="profile-section">
              <div className="profile-section-title">
                <User size={16} />

                <div>
                  <h3>Personal Information</h3>

                  <p>Update your name and email address.</p>
                </div>
              </div>

              <ProfileInput
                label="Full Name"
                name="name"
                value={editProfile.name}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Email Address"
                name="email"
                type="email"
                value={editProfile.email}
                onChange={handleProfileChange}
                placeholder="you@example.com"
              />
            </div>

            {/* ==========================================
                CAREER PROFILE
            ========================================== */}

            <div className="profile-section">
              <div className="profile-section-title">
                <GraduationCap size={16} />

                <div>
                  <h3>Career Profile</h3>

                  <p>
                    Keep your career information updated for better AI
                    recommendations.
                  </p>
                </div>
              </div>

              <ProfileInput
                label="Education"
                name="education"
                value={editProfile.education}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Current GPA"
                name="gpa"
                value={editProfile.gpa}
                onChange={handleProfileChange}
                type="number"
                step="0.01"
                placeholder="0.00 - 4.00"
              />

              <ProfileInput
                label="Skills You Already Have"
                description="Technologies or abilities you already know."
                name="skills"
                value={editProfile.skills}
                onChange={handleProfileChange}
                placeholder="JavaScript, React, Node.js"
              />

              <ProfileInput
                label="Fields You're Interested In"
                description="Areas you would like to learn or work in."
                name="interests"
                value={editProfile.interests}
                onChange={handleProfileChange}
                placeholder="AI, Web Development, Cybersecurity"
              />

              <ProfileInput
                label="Career You Want to Pursue"
                description="The job role you want to achieve in the future."
                name="careerGoal"
                value={editProfile.careerGoal}
                onChange={handleProfileChange}
                placeholder="Full Stack Developer, AI Engineer"
              />

              {profileError && (
                <div className="profile-error">{profileError}</div>
              )}

              {profileMessage && (
                <div className="profile-success">{profileMessage}</div>
              )}

              <button
                className="save-profile"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <RefreshCw size={17} className="loading-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Profile
                  </>
                )}
              </button>
            </div>

            {/* ==========================================
                SECURITY
            ========================================== */}

            <div className="profile-section security-section">
              <div className="profile-section-title">
                <Lock size={16} />

                <div>
                  <h3>Security</h3>

                  <p>Change your account password securely.</p>
                </div>
              </div>

              <ProfileInput
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((previous) => ({
                    ...previous,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter current password"
              />

              <ProfileInput
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((previous) => ({
                    ...previous,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password"
              />

              <ProfileInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((previous) => ({
                    ...previous,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />

              <div className="password-note">
                Password must contain at least 8 characters, including
                uppercase, lowercase, number and special character.
              </div>

              {passwordError && (
                <div className="profile-error">{passwordError}</div>
              )}

              {passwordMessage && (
                <div className="profile-success">{passwordMessage}</div>
              )}

              <button
                className="save-profile password-button"
                onClick={handlePasswordChange}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <RefreshCw size={17} className="loading-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock size={17} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
};

// ==========================================
// SECTION TITLE
// ==========================================

const SectionTitle = ({ icon, title, description }) => {
  return (
    <div className="section-title">
      <div className="section-title-icon">{icon}</div>

      <div>
        <h2>{title}</h2>

        <p>{description}</p>
      </div>
    </div>
  );
};

// ==========================================
// PROFILE INPUT
// ==========================================

const ProfileInput = ({
  label,
  description = "",
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  step,
}) => {
  return (
    <div className="profile-input">
      <label>{label}</label>

      {description && (
        <small className="profile-input-description">{description}</small>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
      />
    </div>
  );
};

export default Dashboard;
