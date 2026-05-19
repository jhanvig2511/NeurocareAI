import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css";

/* =======================
   🔥 PRODUCTION API URL
======================= */
const API_BASE =
  "https://neurocareai-xxrl.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    completedQuestionnaires: 0,
    pendingReviews: 0,
  });

  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      /* STATS */
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      /* USERS */
      const usersRes = await fetch(`${API_BASE}/api/admin/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);

      /* RESPONSES */
      const responsesRes = await fetch(`${API_BASE}/api/admin/responses`);
      const responsesData = await responsesRes.json();
      setResponses(responsesData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-logo">NeuroCare Admin</div>

        <button
          className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>

        <button
          className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>

        <button
          className={`admin-nav-item ${activeTab === "responses" ? "active" : ""}`}
          onClick={() => setActiveTab("responses")}
        >
          📝 Questionnaire Responses
        </button>

        <button
          className={`admin-nav-item ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          💬 Chat Sessions
        </button>

        <button
          className={`admin-nav-item ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Analytics
        </button>

        <button
          className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Settings
        </button>

        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="admin-content">

        {activeTab === "overview" && (
          <>
            <h1>Dashboard Overview</h1>

            <div className="admin-cards">
              <div className="admin-card">
                👥 <h3>Total Users</h3>
                <div>{stats.totalUsers}</div>
              </div>

              <div className="admin-card">
                💬 <h3>Active Chats</h3>
                <div>{stats.activeChats}</div>
              </div>

              <div className="admin-card">
                📝 <h3>Completed Forms</h3>
                <div>{stats.completedQuestionnaires}</div>
              </div>

              <div className="admin-card">
                ⏳ <h3>Pending Reviews</h3>
                <div>{stats.pendingReviews}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1>User Management</h1>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "responses" && (
          <>
            <h1>Questionnaire Responses</h1>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Risk</th>
                </tr>
              </thead>

              <tbody>
                {responses.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.userName}</td>
                    <td>{r.score}</td>
                    <td>{r.riskLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "chats" && <h2>Chat Sessions Coming Soon</h2>}
        {activeTab === "analytics" && <h2>Analytics Coming Soon</h2>}
        {activeTab === "settings" && <h2>Settings Coming Soon</h2>}

      </div>
    </div>
  );
};

export default AdminDashboard;