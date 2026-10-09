import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Users,
  Brain,
  ShieldCheck,
  UserCheck,
  UserCog,
  LogOut,
  Sparkles,
  Mail,
  CalendarDays,
  BarChart3,
  ArrowLeft,
  Trash2,
  Search,
  RefreshCw,
  X,
  Target,
  GraduationCap,
  Eye,
  Filter,
} from "lucide-react";

import "./AdminDashboard.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const AdminDashboard = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnalyses: 0,
    totalAdmins: 0,
    totalNormalUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // USER FILTERS
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ANALYSIS SEARCH
  const [analysisSearch, setAnalysisSearch] = useState("");

  // ACTION LOADING
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);

  // ANALYSIS MODAL
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // CHECK SUPER ADMIN
  // ==========================================

  const checkSuperAdmin = () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const superAdmin = payload.isSuperAdmin === true;

      setIsSuperAdmin(superAdmin);

      return superAdmin;
    } catch (error) {
      console.error("TOKEN DECODE ERROR:", error);

      localStorage.removeItem("token");
      window.location.href = "/login";

      return false;
    }
  };

  // ==========================================
  // FETCH ADMIN DATA
  // ==========================================

  const fetchAdminData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      checkSuperAdmin();

      const config = getConfig();

      const [statsResponse, usersResponse, analysesResponse] =
        await Promise.all([
          axios.get(`${API_URL}/admin/stats`, config),
          axios.get(`${API_URL}/admin/users`, config),
          axios.get(`${API_URL}/admin/analyses`, config),
        ]);

      setStats(
        statsResponse.data || {
          totalUsers: 0,
          totalAnalyses: 0,
          totalAdmins: 0,
          totalNormalUsers: 0,
        },
      );

      setUsers(usersResponse.data?.users || []);
      setAnalyses(analysesResponse.data?.analyses || []);
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (error.response?.status === 403) {
        setError("Access denied. Admin privileges are required.");
        return;
      }

      setError(
        error.response?.data?.message || "Failed to load admin dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchAdminData();
  }, []);

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  const scrollToSection = (section) => {
    if (section === "dashboard") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const sectionId =
      section === "users" ? "admin-users-section" : "admin-analyses-section";

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ==========================================
  // FILTERED USERS
  // ==========================================

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.education?.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "super_admin" && user.isSuperAdmin === true) ||
        (roleFilter === "admin" &&
          user.role === "admin" &&
          user.isSuperAdmin !== true) ||
        (roleFilter === "user" &&
          user.role === "user" &&
          user.isSuperAdmin !== true);

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  // ==========================================
  // FILTERED ANALYSES
  // ==========================================

  const filteredAnalyses = useMemo(() => {
    const search = analysisSearch.trim().toLowerCase();

    if (!search) {
      return analyses;
    }

    return analyses.filter((item) => {
      const userName = item.user?.name?.toLowerCase() || "";

      const userEmail = item.user?.email?.toLowerCase() || "";

      const careerGoals = item.profileSnapshot?.careerGoal?.toLowerCase() || "";

      const recommendations =
        item.careerRecommendations
          ?.map((career) => career.title)
          .join(" ")
          .toLowerCase() || "";

      return (
        userName.includes(search) ||
        userEmail.includes(search) ||
        careerGoals.includes(search) ||
        recommendations.includes(search)
      );
    });
  }, [analyses, analysisSearch]);

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (userId, userName) => {
    const targetUser = users.find((user) => user._id === userId);

    if (!targetUser) {
      return;
    }

    if (targetUser.isSuperAdmin) {
      alert("Super Admin cannot be deleted.");
      return;
    }

    if (targetUser.role === "admin") {
      alert("Admin accounts cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);

      await axios.delete(`${API_URL}/admin/users/${userId}`, getConfig());

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId),
      );

      setStats((currentStats) => ({
        ...currentStats,
        totalUsers: Math.max(0, currentStats.totalUsers - 1),
        totalNormalUsers: Math.max(0, currentStats.totalNormalUsers - 1),
      }));
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "Access denied. Admin privileges are required.",
        );
        return;
      }

      alert(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  // ==========================================
  // CHANGE USER ROLE
  // SUPER ADMIN ONLY
  // ==========================================

  const handleRoleChange = async (userId, userName, currentRole) => {
    if (!isSuperAdmin) {
      alert("Only Super Admin can change user roles.");
      return;
    }

    const targetUser = users.find((user) => user._id === userId);

    if (!targetUser || targetUser.isSuperAdmin) {
      alert("Super Admin role cannot be changed.");
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirmed = window.confirm(
      `Change ${userName}'s role from ${currentRole} to ${newRole}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingRoleId(userId);

      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        {
          role: newRole,
        },
        getConfig(),
      );

      const updatedUser = response.data.user;

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: updatedUser.role,
                isSuperAdmin: updatedUser.isSuperAdmin,
              }
            : user,
        ),
      );

      setStats((currentStats) => ({
        ...currentStats,

        totalAdmins:
          newRole === "admin"
            ? currentStats.totalAdmins + 1
            : Math.max(0, currentStats.totalAdmins - 1),

        totalNormalUsers:
          newRole === "user"
            ? currentStats.totalNormalUsers + 1
            : Math.max(0, currentStats.totalNormalUsers - 1),
      }));
    } catch (error) {
      console.error("UPDATE ROLE ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "Only Super Admin can change user roles.",
        );
        return;
      }

      alert(error.response?.data?.message || "Failed to update user role.");
    } finally {
      setChangingRoleId(null);
    }
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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-orbit orbit-loading-one"></div>

        <div className="admin-loading-orbit orbit-loading-two"></div>

        <div className="admin-loading-icon">
          <Sparkles size={28} />
        </div>

        <h2>Loading Admin Dashboard</h2>

        <p>Fetching CareerAI system data...</p>

        <div className="admin-loading-bars">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="admin-error-page">
        <div className="admin-error-icon">
          <ShieldCheck size={30} />
        </div>

        <h2>Admin Access Required</h2>

        <p>{error}</p>

        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="admin-page">
      {/* BACKGROUND */}

      <div className="admin-grid"></div>

      <div className="admin-orb admin-orb-one"></div>
      <div className="admin-orb admin-orb-two"></div>
      <div className="admin-orb admin-orb-three"></div>

      <div className="admin-particle particle-one"></div>
      <div className="admin-particle particle-two"></div>
      <div className="admin-particle particle-three"></div>

      {/* SIDEBAR */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>CareerAI</strong>
            <span>Administration</span>
          </div>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-label">ADMIN PANEL</span>

          {/* DASHBOARD */}

          <button
            type="button"
            className="admin-sidebar-item active"
            onClick={() => scrollToSection("dashboard")}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>

          {/* USERS */}

          <button
            type="button"
            className="admin-sidebar-item active"
            onClick={() => scrollToSection("users")}
          >
            <Users size={18} />
            Users
          </button>

          {/* AI ANALYSES */}

          <button
            type="button"
            className="admin-sidebar-item active"
            onClick={() => scrollToSection("analyses")}
          >
            <Brain size={18} />
            AI Analyses
          </button>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-role">
            <ShieldCheck size={17} />

            <div>
              <strong>
                {isSuperAdmin ? "Super Administrator" : "Administrator"}
              </strong>

              <span>
                {isSuperAdmin ? "Full system access" : "Admin access"}
              </span>
            </div>
          </div>

          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="admin-main">
        {/* TOPBAR */}

        <header className="admin-topbar">
          <div>
            <div className="admin-eyebrow">
              <span></span>
              CAREERAI ADMINISTRATION
            </div>

            <h1>
              System <span>Overview</span>
            </h1>

            <p>Monitor users, AI activity and platform statistics.</p>
          </div>

          <div className="admin-topbar-actions">
            <button
              type="button"
              className={`admin-refresh-button ${
                refreshing ? "refreshing" : ""
              }`}
              onClick={() => fetchAdminData(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <RefreshCw size={15} />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="back-dashboard"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
          </div>
        </header>

        {/* STAT CARDS */}

        <section className="admin-stats">
          <AdminStatCard
            icon={<Users size={21} />}
            label="Total Users"
            value={stats.totalUsers}
          />

          <AdminStatCard
            icon={<Brain size={21} />}
            label="AI Analyses"
            value={stats.totalAnalyses}
          />

          <AdminStatCard
            icon={<ShieldCheck size={21} />}
            label="Administrators"
            value={stats.totalAdmins}
          />

          <AdminStatCard
            icon={<UserCheck size={21} />}
            label="Normal Users"
            value={stats.totalNormalUsers}
          />
        </section>

        {/* USERS */}

        <section className="admin-section" id="admin-users-section">
          <div className="admin-section-header">
            <div>
              <span>USER MANAGEMENT</span>

              <h2>Registered Users</h2>

              <p>Users currently registered on CareerAI.</p>
            </div>

            <div className="section-count">
              {filteredUsers.length} / {users.length} Users
            </div>
          </div>

          {/* USER CONTROLS */}

          <div className="admin-table-controls">
            <div className="admin-search-box">
              <Search size={15} />

              <input
                type="text"
                placeholder="Search users by name, email or education..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              {userSearch && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setUserSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filter-box">
              <Filter size={14} />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>

                <option value="super_admin">Super Admin</option>

                <option value="admin">Administrators</option>

                <option value="user">Normal Users</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Education</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      <Search size={20} />
                      <span>No users match your search.</span>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isTargetSuperAdmin = user.isSuperAdmin === true;

                    const isTargetAdmin = user.role === "admin";

                    const isDeleting = deletingUserId === user._id;

                    const isChangingRole = changingRoleId === user._id;

                    return (
                      <tr key={user._id} className="admin-user-row">
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <strong>{user.name || "Unknown"}</strong>
                          </div>
                        </td>

                        <td>
                          <div className="table-email">
                            <Mail size={14} />

                            {user.email || "No email"}
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              isTargetSuperAdmin
                                ? "role-badge super-admin-role-badge"
                                : isTargetAdmin
                                  ? "role-badge admin-role-badge"
                                  : "role-badge"
                            }
                          >
                            {isTargetSuperAdmin ? "super admin" : user.role}
                          </span>
                        </td>

                        <td>{user.education || "Not provided"}</td>

                        <td>
                          <div className="table-date">
                            <CalendarDays size={14} />

                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="admin-actions">
                            {isSuperAdmin && !isTargetSuperAdmin && (
                              <button
                                type="button"
                                className="admin-action-button role-action"
                                onClick={() =>
                                  handleRoleChange(
                                    user._id,
                                    user.name,
                                    user.role,
                                  )
                                }
                                disabled={isChangingRole || isDeleting}
                                title={
                                  isTargetAdmin
                                    ? "Change admin to user"
                                    : "Promote user to admin"
                                }
                              >
                                {isChangingRole ? (
                                  <RefreshCw
                                    size={15}
                                    className="button-spinner"
                                  />
                                ) : (
                                  <UserCog size={15} />
                                )}

                                {isChangingRole
                                  ? "Updating..."
                                  : isTargetAdmin
                                    ? "Make User"
                                    : "Make Admin"}
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-action-button delete-action"
                              onClick={() =>
                                handleDeleteUser(user._id, user.name)
                              }
                              disabled={
                                isTargetSuperAdmin ||
                                isTargetAdmin ||
                                isDeleting ||
                                isChangingRole
                              }
                              title={
                                isTargetSuperAdmin
                                  ? "Super Admin cannot be deleted"
                                  : isTargetAdmin
                                    ? "Admin accounts cannot be deleted"
                                    : "Delete user"
                              }
                            >
                              {isDeleting ? (
                                <RefreshCw
                                  size={15}
                                  className="button-spinner"
                                />
                              ) : (
                                <Trash2 size={15} />
                              )}

                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI ANALYSES */}

        <section className="admin-section" id="admin-analyses-section">
          <div className="admin-section-header">
            <div>
              <span>AI ACTIVITY</span>

              <h2>Recent Career Analyses</h2>

              <p>AI-generated career intelligence across the platform.</p>
            </div>

            <div className="section-count">
              {filteredAnalyses.length} / {analyses.length} Analyses
            </div>
          </div>

          {/* ANALYSIS SEARCH */}

          <div className="admin-analysis-controls">
            <div className="admin-search-box">
              <Search size={15} />

              <input
                type="text"
                placeholder="Search by user, email, career goal or recommendation..."
                value={analysisSearch}
                onChange={(e) => setAnalysisSearch(e.target.value)}
              />

              {analysisSearch && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setAnalysisSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="analysis-admin-grid">
            {filteredAnalyses.length === 0 ? (
              <div className="empty-analysis">
                <Brain size={25} />

                <h3>
                  {analyses.length === 0
                    ? "No analyses yet"
                    : "No matching analyses"}
                </h3>

                <p>
                  {analyses.length === 0
                    ? "AI career analyses will appear here."
                    : "Try another search term."}
                </p>
              </div>
            ) : (
              filteredAnalyses.slice(0, 12).map((item, index) => (
                <div className="analysis-admin-card" key={item._id || index}>
                  <div className="analysis-card-glow"></div>

                  <div className="analysis-card-top">
                    <div className="analysis-card-icon">
                      <Brain size={18} />
                    </div>

                    <span>#{index + 1}</span>
                  </div>

                  <h3>{item.user?.name || "Unknown User"}</h3>

                  <p>{item.user?.email || "No email available"}</p>

                  <div className="analysis-card-meta">
                    <span>
                      <Target size={13} />
                      {item.careerRecommendations?.length || 0} Recommendations
                    </span>

                    <span>
                      <Brain size={13} />
                      {item.skillGaps?.length || 0} Skill Gaps
                    </span>
                  </div>

                  <div className="analysis-card-date">
                    <CalendarDays size={13} />

                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </div>

                  <button
                    type="button"
                    className="analysis-view-button"
                    onClick={() => setSelectedAnalysis(item)}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ANALYSIS DETAILS MODAL */}

      {selectedAnalysis && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedAnalysis(null)}
        >
          <div
            className="admin-analysis-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span>AI ANALYSIS DETAILS</span>

                <h2>Career Intelligence Report</h2>

                <p>
                  Generated{" "}
                  {selectedAnalysis.createdAt
                    ? new Date(selectedAnalysis.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedAnalysis(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* USER */}

            <div className="admin-modal-user">
              <div className="modal-user-avatar">
                {selectedAnalysis.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <strong>{selectedAnalysis.user?.name || "Unknown User"}</strong>

                <span>
                  {selectedAnalysis.user?.email || "No email available"}
                </span>
              </div>
            </div>

            {/* PROFILE SNAPSHOT */}

            {selectedAnalysis.profileSnapshot && (
              <div className="admin-modal-block">
                <div className="admin-modal-block-title">
                  <GraduationCap size={16} />
                  Profile Snapshot
                </div>

                <div className="admin-profile-grid">
                  <div>
                    <span>Education</span>

                    <strong>
                      {selectedAnalysis.profileSnapshot.education ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>GPA</span>

                    <strong>
                      {selectedAnalysis.profileSnapshot.gpa || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Career Goal</span>

                    <strong>
                      {selectedAnalysis.profileSnapshot.careerGoal ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Interests</span>

                    <strong>
                      {selectedAnalysis.profileSnapshot.interests?.length
                        ? selectedAnalysis.profileSnapshot.interests.join(", ")
                        : "Not provided"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS */}

            <div className="admin-modal-block">
              <div className="admin-modal-block-title">
                <Target size={16} />
                Career Recommendations
              </div>

              <div className="admin-modal-list">
                {selectedAnalysis.careerRecommendations?.length ? (
                  selectedAnalysis.careerRecommendations.map(
                    (career, index) => (
                      <div className="admin-modal-list-item" key={index}>
                        <span className="modal-list-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <strong>{career.title}</strong>

                          <p>{career.reason || "No explanation available."}</p>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="modal-empty">No recommendations available.</p>
                )}
              </div>
            </div>

            {/* SKILL GAPS */}

            <div className="admin-modal-block">
              <div className="admin-modal-block-title">
                <Brain size={16} />
                Skill Gaps
              </div>

              <div className="modal-skill-list">
                {selectedAnalysis.skillGaps?.length ? (
                  selectedAnalysis.skillGaps.map((skill, index) => (
                    <span key={index}>{skill}</span>
                  ))
                ) : (
                  <p className="modal-empty">No skill gaps available.</p>
                )}
              </div>
            </div>

            {/* ROADMAP */}

            <div className="admin-modal-block">
              <div className="admin-modal-block-title">
                <BarChart3 size={16} />
                Learning Roadmap
              </div>

              <div className="admin-modal-roadmap">
                {selectedAnalysis.learningRoadmap?.length ? (
                  selectedAnalysis.learningRoadmap.map((step, index) => (
                    <div className="admin-modal-roadmap-item" key={index}>
                      <div className="modal-roadmap-number">
                        {String(step.step || index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <strong>{step.title}</strong>

                        <p>{step.description || "No description available."}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="modal-empty">No roadmap available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ADMIN STAT CARD
// ==========================================

const AdminStatCard = ({ icon, label, value }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-depth"></div>

      <div className="admin-stat-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
};

export default AdminDashboard;
