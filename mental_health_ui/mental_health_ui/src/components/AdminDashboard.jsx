import React, { useState, useEffect } from 'react';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    completedQuestionnaires: 0,
    pendingReviews: 0
  });

  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    // Fetch admin data
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Replace with your actual API endpoints
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      const responsesRes = await fetch('/api/admin/responses');
      const responsesData = await responsesRes.json();
      setResponses(responsesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">NeuroCare Admin</div>
        
        <button 
          className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          📝 Questionnaire Responses
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          💬 Chat Sessions
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        
        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <>
            <h1>Dashboard Overview</h1>
            <p className="admin-subtitle">Monitor your platform's performance</p>
            
            <div className="admin-cards">
              <div className="admin-card">
                <div className="card-icon">👥</div>
                <h3>Total Users</h3>
                <div className="card-value">{stats.totalUsers}</div>
              </div>
              
              <div className="admin-card">
                <div className="card-icon">💬</div>
                <h3>Active Chats</h3>
                <div className="card-value">{stats.activeChats}</div>
              </div>
              
              <div className="admin-card">
                <div className="card-icon">📝</div>
                <h3>Completed Forms</h3>
                <div className="card-value">{stats.completedQuestionnaires}</div>
              </div>
              
              <div className="admin-card">
                <div className="card-icon">⏳</div>
                <h3>Pending Reviews</h3>
                <div className="card-value">{stats.pendingReviews}</div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">2 hours ago</span>
                  <span className="activity-desc">New user registered</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">5 hours ago</span>
                  <span className="activity-desc">Questionnaire completed by user #234</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">1 day ago</span>
                  <span className="activity-desc">15 new chat sessions started</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h1>User Management</h1>
            <p className="admin-subtitle">View and manage registered users</p>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'responses' && (
          <>
            <h1>Questionnaire Responses</h1>
            <p className="admin-subtitle">Review user mental health assessments</p>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Response ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Risk Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map(response => (
                    <tr key={response.id}>
                      <td>{response.id}</td>
                      <td>{response.userName}</td>
                      <td>{new Date(response.submittedAt).toLocaleDateString()}</td>
                      <td>{response.score}</td>
                      <td>
                        <span className={`risk-level ${response.riskLevel}`}>
                          {response.riskLevel}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Review</button>
                        <button className="action-btn">Export</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'chats' && (
          <>
            <h1>Chat Sessions</h1>
            <p className="admin-subtitle">Monitor ongoing and past conversations</p>
            <div className="info-message">
              Chat session monitoring coming soon...
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <h1>Analytics</h1>
            <p className="admin-subtitle">Insights and trends</p>
            <div className="info-message">
              Advanced analytics dashboard coming soon...
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <h1>Settings</h1>
            <p className="admin-subtitle">Configure your admin preferences</p>
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="setting-item">
                <label>Platform Name</label>
                <input type="text" defaultValue="NeuroCare" />
              </div>
              <div className="setting-item">
                <label>Support Email</label>
                <input type="email" defaultValue="support@neurocare.com" />
              </div>
              <button className="save-btn">Save Changes</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;